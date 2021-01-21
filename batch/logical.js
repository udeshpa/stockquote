const db = require('./db');
var datasource = require("./datasource");
var Bottleneck = require("bottleneck");

const limiter = new Bottleneck({
    maxConcurrent: 2,
    minTime: 333
});

limiter.on("failed", function (error, jobInfo) {
  // This will be called every time a job fails. DO NOTHING
});

limiter.on("error", function (error) {
  /* handle errors here */
});



async function updateStockRecord(ticker, sreqconfig, dbclient) {
  return new Promise(async (resolve, reject) => {
            try{
              var recentquoteupdate = await db.getRecentStockQuoteUpdate(ticker, dbclient);
              console.log('recentupdate quote: ', recentquoteupdate);

              if(!recentquoteupdate || recentquoteupdate.ageindays > 0) {
                console.log('updateStockQuote for ', ticker, recentquoteupdate ? recentquoteupdate.ageindays : 'recentquote = null');
                await limiter.schedule(async () => datasource.updateStockQuote(ticker, sreqconfig.stockquote, dbclient));
              }

              var recentupdate = await db.getRecentStockDetailUpdate(ticker, dbclient);
              console.log('recentupdate detail', recentupdate);
              if(!recentupdate || recentupdate.ageindays > 0) {
                console.log('updateStockDetails for: ', ticker, recentupdate ? recentupdate.ageindays : 'recentupdate = null');
                await limiter.schedule(() => datasource.updateStockDetails(ticker, sreqconfig.stockdetails, dbclient));
              }

              resolve();

          }catch(err) {
              console.log(err);
              reject(err);
          }
  });
}

module.exports.updateStockRecord = updateStockRecord;