const {
    PORT = 3001,
    DB_CONNECTION = ''
} = process.env

const express = require('express');
const app = express();
const filtersort = require('./filtersort');


const db = require('./db');
const config = require('./config.js');
const sreqconfig = global.gConfig['StockRequest'];
console.log(sreqconfig);

const logical = require('./logical');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var pg = require('pg');

try {
    var client = new pg.Client({
        connectionString: DB_CONNECTION
    });
}catch(err) {
    console.log(err);
}

client.connect();

var fs = require('fs');
var https = require('https');

const environment = require('./environment');

app.use(express.json());

app.get('/getindexes', async function(req, res){
    var indexes = await db.getIndexes(client);
    console.log(indexes);
    res.send(indexes);
});

app.get('/getRequests', async function (req, res) {

    var requests = await db.getRequestsByUser(req.query.userid, client);
    console.log(requests);
    res.send(requests); 

});

app.post('/deleteRequest', async function(req, res){
    try {
        console.log('Inside deleteRequest' + req.body.requestid);
        await db.deletetickerRequest(req.body.requestid, client);
        await db.deleteRequest(req.body.requestid, client);
        await db.deleteFilters(req.body.requestid, client);
        res.status(200).send('SUCCESS');

    }catch(err) {
        console.log(err);
        res.status(500).send('deleteRequest Error:', err);
    }
});

app.get('/getallfilters', async function(req, res){

    try{
        console.log('Inside getallfilters');
        var filters = await db.getAllFilters(client);
        res.send(filters);
    }catch(err) {
        console.log(err);
        res.status(500).send('getallfilters Error:', err);
    }

});


app.post('/uploadtickers', async function(req, res) {
    console.log(req.body);
    console.log(req.body.tickers);

    var reqid = await logical.persistReq(req.body.tickers, req.body.indexid ? req.body.indexid : 0, req.body.userid, sreqconfig, client);
    console.log(reqid);
    try {
        var rows = await logical.queryRequest(reqid, client);
    }catch(err) {
        console.log(err);
    }
    var op = {};
    op['requestid'] = reqid;
    op['stocks'] = rows;
    res.send(op);

});


var sortclausedict = {}
sortclausedict['yearchangepercent'] = 'yearchangepercent';
sortclausedict['year5changepercent'] = 'year5changepercent';
sortclausedict['low52distance'] = ' (((previousclose - low52) * 100) / low52) ';


app.get('/filtersort', async function(req, res) {
    console.log('/getfiltersort 1', req.query);

    var op = await filtersort.getfiltersort(req, client);
    res.send(op);

});



app.post('/filtersort', async function(req, res) {
    console.log(req.body);

    var op = await filtersort.postfiltersort(req, client);
    res.send(op);

});

app.post('/deletefilters', async function(req, res) {
    console.log('/deletefilters 1', req.body.requestid);

    var op = await filtersort.deletefilters(req, client);
    res.send(op);

});

https.createServer({
    key: fs.readFileSync('./httpskeycert/earnprosper.com+4-key.pem'),
    cert: fs.readFileSync('./httpskeycert/earnprosper.com+4.pem')
}, app).listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
