const https = require("https");
const db = require('./db');

async function updateStockDetails(ticker, sdconfig, dbclient) {

    return new Promise((resolve, reject) => {

        try{
                const url = sdconfig.baseurl + ticker + sdconfig.relativeurl + '?token=' + sdconfig.token;
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
                            reject('Exception while inserting ', err );
                        }
                    });
                });

                httpreq.on('timeout', () => {
                    httpreq.abort();
                    reject('Timeout in http');
                });

                httpreq.on('error', function(err) {
                    httpreq.abort();
                    reject(err);
                });
        }catch(err) {
            console.log('Error while http get stockdetails: ' + err);
            reject(err);
        }
    });
}

async function updateStockQuote(ticker, sqconfig, dbclient) {

    return new Promise((resolve, reject) => {
        try{
                const url = sqconfig.baseurl + ticker + sqconfig.relativeurl + '?token=' + sqconfig.token;

                console.log(url);
                
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
                            reject(err);
                        }
                    });
                });

                httpreq.on('timeout', () => {
                    httpreq.abort();
                    reject('Received Timeout');
                });

                httpreq.on('error', function(err) {
                    httpreq.abort();
                    reject(err);
                });

        }catch(err) {
            console.log('Error while http get stockquote: ' + err);
            reject(err);
        }
    });
}

module.exports.updateStockQuote = updateStockQuote;
module.exports.updateStockDetails = updateStockDetails;
