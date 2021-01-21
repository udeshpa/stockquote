const {
    PORT = 3000,
    DB_CONNECTION = 'postgres://udaydeshpande@localhost:5432/frontend',
    GOOGLE_SIGNIN_CLIENT_ID = '',
    PAYPAL_CLIENT_ID = ''
} = process.env


const express = require('express');
const path = require('path');
const config = require('./config.js');

var bodyParser = require("body-parser");

const frontenddb = require('./frontenddb');

const api = require('./paypalapi');

const app = express();

const formidable = require('formidable');
const proxy = require('./proxy');
const login = require('./loginsession');
var readlines = require('n-readlines');
var https = require('https');
var fs = require('fs');


login.setSession(app);

//app.set('view engine', 'pug');
//app.set('views', path.join(__dirname, '/views'));

app.use(express.static('static'));

app.use(bodyParser.urlencoded({ extended: false }));


const sreqconfig = global.gConfig['StockRequest'];

console.log(sreqconfig);



var products = new Object();



var pg = require('pg');

try {
        var client = new pg.Client({
        connectionString: DB_CONNECTION//sreqconfig.dbconnection.frontend
    });
}catch(err) {
    console.log(err);
}

client.connect();

app.set('dbclient', client);

require('./loginsubscriberoutes')(app);


init();

async function init() {

    var paymentplans = await api.loadPaymentPlans();
    //console.log('num plans = ' + paymentplans.plans.length);
    paymentplans.plans.forEach(async function(element) {
        var plandetails = await api.loadPaymentPlanDetails(element.id);
        console.log(plandetails );

        if(!products[plandetails.product_id]) {
            var product = await api.loadProducts(plandetails.product_id);
            //console.log(product);
            products[plandetails.product_id] = product;
            var p = await frontenddb.getOrInsertProduct(product.id, product.name, product.description, product.image_url, product.home_url, client);
            //console.log(p);
        }

        frontenddb.getOrInsertPlanId(plandetails.id, plandetails.name, plandetails.product_id, client);
    });
}

app.get('/main', login.redirectLoginOrSubscribe, async function (req, res) {
    console.log('Inside main');
   // console.log(req.session);
    //console.log(req.session.user.userid);
    //console.log(fltrs);
    res.sendFile('main.html', { root: path.join(__dirname, 'public') });
    console.log('Exitng main');
    return;
});


var util = require('util');

async function uploadReq(file, indexid, tckrs, userid, sreqconfig) {
    console.log(sreqconfig, tckrs);

    var tickers = [];

    if(tckrs && tckrs.length != 0) {
        tickers.push(...tckrs);
    }

    if(file) {
      var liner = new readlines(file.path);


      while(next = liner.next()) {
          var ticker = next.toString('ascii');
          tickers.push(ticker);
          console.log(ticker);
      }
    }

    try {
      return await proxy.updateStockQuote(tickers, indexid, userid, sreqconfig.stockquote);
    }catch(err) {
      console.log(err);
    }
}


app.post('/uploadtickers', login.redirectLoginOrSubscribe,  async function(req, res) {
    //res.send('Hello');
    console.log('here1');

    var form = new formidable.IncomingForm();
    form.parse(req, async function(err, fields, files) {
        console.log('here1 ' + util.inspect({fields: fields, files: files}));
        if(fields && fields.indexid) {
            console.log('fields & indexid non empty');
        }
        if(fields && fields.tickers) {
            var tickers = fields.tickers.split(',');
        }
        var op = await uploadReq(files.file, fields.indexid, tickers, req.session.user.userid, sreqconfig );
        console.log(op);
        res.send(op);
    });

});


app.post('/deleteRequest', async function(req, res){
    try{
        console.log('Inside frontend deleteRequest', req.body);
        await proxy.deleteRequest(req.body.requestid, sreqconfig.stockquote);
        res.status(200).send('SUCCESS');
    }catch(err) {
        console.log(err);
        res.status(500).send('deleteRequest Error:', err);
    }
});

app.get('/getAllFilters', login.redirectLoginOrSubscribe, async (req, res) => {
    try{
        var filters = await proxy.getAllFilters(sreqconfig.stockquote);
        res.send(filters);
    }catch(err) {
        console.log(err);
        res.send(err);
    }
});

var keyMatch = function(o,r){

    var c  = 0;
    var nO = {};

    Object.keys(o).forEach(function(k){
        c++;    
        if(k.match(r)) {
            nO[k.slice(0, -1)] = o[k];
        }
    });

    return nO;
};

function isEmpty(obj) {
   return Object.keys(obj).length === 0 && obj.constructor === Object
}

app.post('/filtersort', async function(req, res) {
    console.log('postfiltersort', req.body);

    var conj1 = keyMatch(req.body, /1$/)
    console.log('conj1', conj1);

    var conj2 = keyMatch(req.body, /2$/)
    console.log('conj2', conj2);

    var conj3 = keyMatch(req.body, /3$/)
    console.log('conj3', conj3);

    var conjunctions = [];
    if(!isEmpty(conj1))
        conjunctions.push(conj1);

    if(!isEmpty(conj2))
        conjunctions.push(conj2);
    
    if(!isEmpty(conj3))
        conjunctions.push(conj3);

    var result = await proxy.postFilteredStocks(req.body.requestid, conjunctions, sreqconfig.stockquote);
    res.send(result);
});

app.get('/filtersort', async function(req, res) {
    console.log('getfiltersort');
    var result = await proxy.getFilteredStocks(req.query.requestid, sreqconfig.stockquote);
    res.send(result);

});

app.post('/deletefilters', async function(req, res) {
    console.log('deletefilters', req.body.requestid);
    var result = await proxy.deleteFilters(req.body.requestid, sreqconfig.stockquote);
    res.send(result);
});


app.get('/getRequests', login.redirectLoginOrSubscribe, async function(req, res) {
    console.log('Inside getResuests');
    console.log('session user is:', req.session.user);
    var result = await proxy.getRequests(req.session.user.userid, sreqconfig.stockquote);
    res.send(result);

});

app.get('/getIndexes', login.redirectLoginOrSubscribe, async function(req, res) {
    var result = await proxy.getIndexes(sreqconfig.stockquote);
    res.send(result);
})

app.get('/getLoginConfiguration', async function(req, res) {
    var o = {};
    o['googlesigninclientid'] = GOOGLE_SIGNIN_CLIENT_ID;
    o['paypalclientid'] = PAYPAL_CLIENT_ID;
    console.log(o);
    res.send(o);
})

app.get('/getPaymentPlans', async function(req, res) {
    console.log('Inside getPaymentPlans');

    try {
        rows = await frontenddb.getPaymentPlans(client);
        console.log(rows);
        res.send(rows);
    }catch(err) {
        console.log(err);
    }
})


https.createServer({
    key: fs.readFileSync('./httpskeycert/earnprosper.com+4-key.pem'),
    cert: fs.readFileSync('./httpskeycert/earnprosper.com+4.pem')
}, app).listen(PORT, () => console.log(`Example app listening on port ${PORT} ${login.x } ! `));

