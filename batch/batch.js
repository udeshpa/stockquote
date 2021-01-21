const db = require('./db');
const config = require('./config.js');
const sreqconfig = global.gConfig['StockRequest'];
const logical = require('./logical');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var pg = require('pg');

try {
    var client = new pg.Client({
        connectionString: sreqconfig.dbconnection.stockquote
    });
}catch(err) {
    console.log(err);
}

client.connect();


async function performStockUpdates() {

    var tickers = await db.getAllTickers(client);

    console.log(tickers);

    await Promise.all(tickers.map(async (ticker) => {
        await logical.updateStockRecord(ticker.ticker, sreqconfig, client);
    }));

    process.exit();

}

performStockUpdates();

