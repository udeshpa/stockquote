
async function getIndexes(client) {
    return new Promise((resolve, reject) => {

        client.query("SELECT * from stockindex",
        [],
            (err, res) =>  {
                if(!err) {
                    console.log(res.rows);
                    resolve(res.rows);
                }
                else
                    reject(err);
            }
        );
        });

}

async function insertTickerRequests(ticker, requestid, client) {
    return new Promise((resolve, reject) => {
        client.query("INSERT INTO ticker_request(ticker, requestid) values($1, $2) RETURNiNG *",
        [ticker, requestid],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows[0]);
            }
            else
                reject(err);
        });
    });
}

async function insertRequest(userid, indexid, client) {
    return new Promise((resolve, reject) => {
        client.query("INSERT INTO request (userid, indexid) values ($1, $2) RETURNING *", [userid, indexid],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows[0]);
            }
            else
                reject(err);
        });
    });
}

async function insertRequestFilter(requestid, filtername, filtervalue, filtergroup, client) {
    return new Promise((resolve, reject) => {
        client.query("INSERT INTO request_filter (requestid, filtername, filtervalue, filtergroup) values ($1, $2, $3, $4) RETURNING *", [requestid, filtername, filtervalue, filtergroup],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows[0]);
            }
            else
                reject(err);
        });
    });
}


async function getRequestRow(requestid, client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT * FROM request where requestid = $1",
        [requestid],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows);
            }
            else
                reject(err);
        });
    });
}

async function queryIndexRequest(indexid, filterclause, sortclause, client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT sd.*, sq.* FROM index_ticker it, stockdetails sd, stockquote sq " +
                        "where it.ticker = sd.ticker and sq.ticker=it.ticker and it.indexid = $1 " +
                        (filterclause ? " and " + filterclause : "") +
                        (sortclause ? " " + sortclause : ""),
        [indexid],
            (err, res) =>  {
                if(!err) {
                    //console.log(indexid , res.rows);
                    resolve(res.rows);
                }
                else
                    reject(err);
            }
        );
        });
}


async function queryTickerRequest(requestid, filterclause, sortclause, client) {
    console.log('inside queryTickerRequest', requestid, filterclause);
    return new Promise((resolve, reject) => {
        client.query("SELECT sd.ticker, sd.day200movingavg, sd.day50movingavg, sd.ttmdivrate, sd.ttmeps, "
        +" sd.sharesoutstanding, sd.year5changepercent, sd.year2changepercent, sd.yearchangepercent, "
        + " sd.ytdchangepercent, sd.peratio, sd.beta, sd.totalcash, sd.currentdebt, sd.revenue, sd.grossprofit, "
        + " sd.totalrevenue, sd.ebitda, sd.revenuepershare, sd.revenueperemployee, sd.debttoequity, sd.profitmargin, "
        + " sd.enterprisevalue, sd.evtorevenue, sd.marketcap, sd.pricetosales, sd.pricetobook, sd.forwardpe, sd.peg, sd.pehigh, "
        + " sd.pelow, sd.dividendyield, TO_CHAR(sd.nextearningdate :: DATE, 'mm/dd/yyyy') as nextearningdate, sd.avg10vol, sd.avg30vol, "
        + " TO_CHAR(sd.gendate  :: DATE, 'mm/dd/yyyy') as gendate, "
        + " sq.ticker, sq.companyname, sq.previousclose, sq.high52, sq.low52, TO_CHAR(sd.gendate  :: DATE, 'mm/dd/yyyy') as gendate FROM ticker_request tr, stockdetails sd, stockquote sq " +
                        "where tr.ticker = sd.ticker and sq.ticker=tr.ticker and tr.requestid = $1 " +
                        (filterclause ? " and " + filterclause : "") +
                        (sortclause ? " " + sortclause : ""),
        [requestid],
            (err, res) =>  {
                if(!err) {
                    console.log(requestid , res.rows);
                    resolve(res.rows);
                }
                else
                    reject(err);
            }
        );
        });
}

function roundPercent(x) {
    return x ? (100 * x).toFixed(2) : x;
}

function roundMillion(x) {
    return x ? (x/1000000).toFixed(2) : x;
}

function round(x) {
    return x ? (x/1).toFixed(2) : x;
}

async function insertStockDetails(ticker, sd, client) {
    var insertRow = [ticker, sd.day200MovingAvg, sd.day50MovingAvg, sd.ttmDividendRate, sd.ttmEPS,
        roundMillion(sd.sharesOutstanding), roundPercent(sd.year5ChangePercent), roundPercent(sd.year2ChangePercent),
        roundPercent(sd.year1ChangePercent), roundPercent(sd.ytdChangePercent), sd.peRatio, round(sd.beta), roundMillion(sd.totalCash),
        roundMillion(sd.currentDebt), roundMillion(sd.revenue), roundMillion(sd.grossProfit), roundMillion(sd.totalRevenue), sd.EBITDA,
        sd.revenuePerShare, sd.revenuePerEmployee, sd.debtToEquity, roundPercent(sd.profitMargin),
        roundMillion(sd.enterpriseValue), sd.enterpriseValueToRevenue, roundMillion(sd.marketcap), sd.priceToSales, round(sd.priceToBook),
        sd.forwardPERatio, sd.pegRatio, round(sd.peHigh), round(sd.peLow), roundPercent(sd.dividendYield), sd.nextEarningsDate,
        roundMillion(sd.avg10Volume), roundMillion(sd.avg30Volume),
        sd.day200MovingAvg, sd.day50MovingAvg, sd.ttmDividendRate, sd.ttmEPS,
        roundMillion(sd.sharesOutstanding), roundPercent(sd.year5ChangePercent), roundPercent(sd.year2ChangePercent),
        roundPercent(sd.year1ChangePercent), roundPercent(sd.ytdChangePercent), sd.peRatio, round(sd.beta), roundMillion(sd.totalCash),
        roundMillion(sd.currentDebt), roundMillion(sd.revenue), roundMillion(sd.grossProfit), roundMillion(sd.totalRevenue), sd.EBITDA,
        sd.revenuePerShare, sd.revenuePerEmployee, sd.debtToEquity, roundPercent(sd.profitMargin),
        sd.enterpriseValue, sd.enterpriseValueToRevenue, sd.marketcap, sd.priceToSales, round(sd.priceToBook),
        sd.forwardPERatio, sd.pegRatio, round(sd.peHigh), round(sd.peLow), roundPercent(sd.dividendYield), sd.nextEarningsDate,
        roundMillion(sd.avg10Volume), roundMillion(sd.avg30Volume)];

       // console.log(insertRow);

    return new Promise((resolve, reject) => {
        client.query("INSERT INTO public.stockdetails(" +
            "ticker, day200movingavg, day50movingavg, ttmdivrate, ttmeps, " +
            "sharesoutstanding, year5changepercent, year2changepercent, " +
            "yearchangepercent, ytdchangepercent, peratio, beta, totalcash, " +
            "currentdebt, revenue, grossprofit, totalrevenue, ebitda, " +
            "revenuepershare, revenueperemployee, debttoequity, profitmargin, " +
            "enterprisevalue, evtorevenue, marketcap, pricetosales, pricetobook, " +
            "forwardpe, peg, pehigh, pelow, dividendyield, gendate, nextearningdate, " +
            "avg10vol, avg30vol) " +
            "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22," + 
                "$23, $24, $25, $26, $27, $28, $29, $30, $31, $32, NOW(), $33, $34, $35) " +
            "ON CONFLICT (ticker) DO UPDATE SET " +
            "day200movingavg = $36, day50movingavg = $37, ttmdivrate = $38, ttmeps = $39, " +
            "sharesoutstanding = $40, year5changepercent = $41, year2changepercent= $42, " +
            "yearchangepercent = $43, ytdchangepercent = $44,  peratio = $45, beta = $46, totalcash = $47, " +
            "currentdebt = $48, revenue = $49, grossprofit = $50, totalrevenue = $51, ebitda = $52, " +
            "revenuepershare = $53, revenueperemployee = $54, debttoequity = $55, profitmargin = $56"
            + ", enterprisevalue = $57, evtorevenue = $58, marketcap = $59, pricetosales = $60, pricetobook = $61, " +
            "forwardpe = $62, peg = $63, pehigh = $64, pelow = $65, dividendyield = $66, gendate = NOW(), nextearningdate =  $67, " +
            "avg10vol = $68, avg30vol =  $69",
            insertRow,
            (err, res) =>  {
                if(!err) {
                    console.log(res);
                    resolve(res.rows);
                }
                else {
                    console.log(err);
                    reject(err);
                }
            }
        );
        });
}

async function insertStockQuote(ticker, sq, client) {
    var insertRow = [sq.symbol, sq.companyName, sq.previousClose, sq.week52High,
            sq.week52Low, sq.companyName, sq.previousClose, sq.week52High,
            sq.week52Low];

    //console.log(insertRow);

    return new Promise((resolve, reject) => {
        client.query("INSERT INTO stockquote(" +
            "ticker, companyname, previousclose, high52, low52, gendate) " +
            "VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT (ticker)  " +
            "DO  UPDATE SET companyname = $6, previousclose = $7, high52 = $8, " +
            "low52 = $9, gendate = NOW()",
            insertRow,
            (err, res) =>  {
                if(!err) {
                    console.log(res);
                    resolve(res.rows);
                }
                else
                    reject(err);
            }
        );
        });
}

async function getRecentStockDetailUpdate(ticker, client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT ticker, date_part('day', age(NOW(), gendate)) as ageindays from  stockdetails where ticker = $1",
        [ticker],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows[0]);
            }
            else
                reject(err);
        });
    });
}

async function getRecentStockQuoteUpdate(ticker, client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT ticker, date_part('day', age(NOW(), gendate)) as ageindays from  stockquote where ticker = $1",
        [ticker],
        (err, res) =>  {
            if(!err) {
                console.log(res.rows);
                resolve(res.rows[0]);
            }
            else
                reject(err);
        });
    });
}

async function getRequestsByUser(userid, client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT r.requestid, r.userid " +
        "FROM request r where r.userid = $1",
        [userid],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows);
            }
            else
                reject(err);
        });
    });
}

async function getTickersForIndex(indexid, client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT ticker from index_ticker where indexid = $1",
        [indexid],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows);
            }
            else
                reject(err);
        });
    });
}


async function getTickersForRequest(requestid, client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT ticker from ticker_request where requestid = $1",
        [requestid],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows);
            }
            else
                reject(err);
        });
    });
}

async function getFiltersForRequest(requestid, client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT filtervalue, filtergroup, filtername from request_filter where requestid = $1",
        [requestid],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows);
            }
            else
                reject(err);
        });
    });
}


async function deleteFilters(requestid, client) {
    return new Promise((resolve, reject) => {
        client.query("DELETE FROM request_filter where requestid = $1",
        [requestid],
        (err, res) =>  {
            if(!err) {
                resolve(res);
            }
            else
                reject(err);
        });
    });
}


async function deletetickerRequest(requestid, client) {
    return new Promise((resolve, reject) => {
        client.query("DELETE FROM ticker_request where requestid = $1",
        [requestid],
        (err, res) =>  {
            if(!err) {
                resolve(res);
            }
            else
                reject(err);
        });
    });
}

async function deleteRequest(requestid, client) {
    return new Promise((resolve, reject) => {
        client.query("DELETE FROM request where requestid = $1",
        [requestid],
        (err, res) =>  {
            if(!err) {
                resolve(res);
            }
            else
                reject(err);
        });
    });

}


async function getAllFilters(client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT id, filtername, display FROM filter;",
        [],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows);
            }
            else
                reject(err);
        });
    });
}

async function getTickersByIndexid(indexid, client){
    return new Promise((resolve, reject) => {
        client.query("SELECT ticker FROM public.index_ticker where indexid = $1",
        [indexid],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows);
            }
            else
                reject(err);
        });
    });
}


module.exports.insertTickerRequests = insertTickerRequests;
module.exports.insertRequest = insertRequest;
module.exports.queryTickerRequest = queryTickerRequest;
module.exports.insertStockDetails = insertStockDetails;
module.exports.insertStockQuote = insertStockQuote;
module.exports.getRecentStockDetailUpdate = getRecentStockDetailUpdate;
module.exports.getRecentStockQuoteUpdate = getRecentStockQuoteUpdate;
module.exports.getRequestsByUser = getRequestsByUser;
module.exports.getTickersForRequest = getTickersForRequest;
module.exports.getAllFilters = getAllFilters;
module.exports.deleteRequest = deleteRequest;
module.exports.deletetickerRequest = deletetickerRequest;
module.exports.getIndexes = getIndexes;
module.exports.getTickersByIndexid = getTickersByIndexid;
module.exports.queryIndexRequest = queryIndexRequest;
module.exports.getRequestRow = getRequestRow;
module.exports.getTickersForIndex = getTickersForIndex;
module.exports.insertRequestFilter = insertRequestFilter;
module.exports.deleteFilters = deleteFilters;
module.exports.getFiltersForRequest = getFiltersForRequest;
