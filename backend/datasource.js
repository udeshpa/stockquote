const https = require("https");
const db = require('./db');

const {
    IEX_CLOUD_TOKEN = ''
} = process.env

async function updateStockDetails(ticker, sdconfig, dbclient) {

    return new Promise((resolve, reject) => {

        try{
                const url = sdconfig.baseurl + ticker + sdconfig.relativeurl + '?token=' + IEX_CLOUD_TOKEN;
                const httpreq = https.get(url, res => {
                    res.setEncoding("utf8");
                    let body = "";
                    res.on("data", data => {
                        body += data;
                    });
                    res.on("end", async function() {
                        console.log(body);
                        try {
                            var jsonbody = JSON.parse(body);
                            var rows = await db.insertStockDetails(ticker, jsonbody, dbclient);
                            resolve();
                        }catch(err) {
                            console.log(err + ":" + ticker + ": body is : " + body);
                            resolve();
                            //reject('Exception while inserting ', err );
                        }
                    });
                });

                httpreq.on('timeout', () => {
                    httpreq.abort();
                    resolve();
                    //reject('Timeout in http');
                });

                httpreq.on('error', function(err) {
                    httpreq.abort();
                    //reject(err);
                    resolve();
                });
        }catch(err) {
            console.log('Error while http get stockdetails: ' + err);
            resolve();
            //reject(err);
        }
    });
}

async function updateStockQuote(ticker, sqconfig, dbclient) {

    return new Promise((resolve, reject) => {
        try{
                const url = sqconfig.baseurl + ticker + sqconfig.relativeurl + '?token=' + IEX_CLOUD_TOKEN;
                const httpreq = https.get(url, res => {
                    res.setEncoding("utf8");
                    let body = "";
                    res.on("data", data => {
                        body += data;
                    });
                    res.on("end", async function() {
                        console.log(body);
                        try {
                            var jsonbody = JSON.parse(body);
                            var rows = await db.insertStockQuote(ticker, jsonbody, dbclient);
                            resolve(rows);
                        }catch(err) {
                            console.log(err + ":" + ticker + ": body is: " + body);
                            resolve();
                            //reject(err);
                        }
                    });
                });

                httpreq.on('timeout', () => {
                    httpreq.abort();
                    resolve();
                    //reject('Received Timeout');
                });

                httpreq.on('error', function(err) {
                    httpreq.abort();
                    resolve();
                    //reject(err);
                });

        }catch(err) {
            console.log('Error while http get stockquote: ' + err);
            resolve();
            //reject(err);
        }
    });
}

module.exports.updateStockQuote = updateStockQuote;
module.exports.updateStockDetails = updateStockDetails;
