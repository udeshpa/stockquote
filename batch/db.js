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


async function getAllTickers(client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT ticker FROM stockdetails",
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


module.exports.insertStockDetails = insertStockDetails;
module.exports.insertStockQuote = insertStockQuote;
module.exports.getRecentStockDetailUpdate = getRecentStockDetailUpdate;
module.exports.getRecentStockQuoteUpdate = getRecentStockQuoteUpdate;
module.exports.getAllTickers = getAllTickers;
