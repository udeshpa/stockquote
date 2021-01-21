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

async function getTickers(requestid, dbclient) {
  var requestrecord = await db.getRequestRow(requestid, dbclient);

  var rows = null;

  if(requestrecord[0].indexid != 0) {
      rows = await db.getTickersForIndex(requestrecord[0].indexid, dbclient);
  }
  else {
      rows = await db.getTickersForRequest(requestid, dbclient);
  }

  return rows;
}

async function queryRequest(requestid, filterclause, sortclause, dbclient) {
  var requestrecord = await db.getRequestRow(requestid, dbclient);
  console.log('inside queryRequest', requestrecord, filterclause);
  var rows = null;

  if(!requestrecord)
    return [];

  try {
      if(requestrecord[0].indexid && requestrecord[0].indexid != 0) {
        console.log('inside queryRequest 1', requestrecord);

        rows = await db.queryIndexRequest(requestrecord[0].indexid, filterclause, sortclause, dbclient);
      }
      else {
        console.log('inside queryRequest 2');
        rows = await db.queryTickerRequest(requestid, filterclause, sortclause, dbclient);

      }
  }catch(err) {
    console.log(err);
  }

  return rows;
}

async function persistReq(tickers, indexid, userid, sreqconfig, dbclient) {
    console.log('persisReq', tickers, userid, indexid);
    console.log(sreqconfig);
    try {
        var reqrow = await db.insertRequest(userid, indexid, dbclient);
        if(tickers == undefined || tickers.length == 0 ) {
            rows = await db.getTickersByIndexid(indexid, dbclient);
            tickers = rows.map(x => x.ticker);
        }
        console.log(tickers, tickers.length);
        await Promise.all(tickers.map(async (ticker) => {
            console.log(ticker);
            if(!indexid) {
              //No need to add these rows since the indexid is stored for request
              await db.insertTickerRequests (ticker, reqrow.requestid, dbclient);
            }

            await updateStockRecord(ticker, sreqconfig, dbclient);
        }));

        return reqrow.requestid;
    }catch(err) {
      console.log('Inside persist' + userid + err);
    }
}

async function updateStockRecord(ticker, sreqconfig, dbclient) {
  return new Promise(async (resolve, reject) => {
            try{
              var recentquoteupdate = await db.getRecentStockQuoteUpdate(ticker, dbclient);
              console.log(recentquoteupdate);

              if(!recentquoteupdate || recentquoteupdate.ageindays > 0) {
                console.log('updateStockQuote for ', ticker, recentquoteupdate ? recentquoteupdate.ageindays : 'recentquote = null');
                await limiter.schedule(async () => datasource.updateStockQuote(ticker, sreqconfig.stockquote, dbclient));
              }

              var recentupdate = await db.getRecentStockDetailUpdate(ticker, dbclient);
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

module.exports.persistReq = persistReq;
module.exports.queryRequest = queryRequest;
module.exports.getTickers = getTickers;
module.exports.updateStockRecord = updateStockRecord;

