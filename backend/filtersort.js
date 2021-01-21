const logical = require('./logical');
const config = require('./config.js');

const sreqconfig = global.gConfig['StockRequest'];
const db = require('./db');

function processClause(clause) {
    var retval = '(';

    var first = true;

    if(clause.pelt) {
        if(!first)
            retval += ' and '

        retval += 'peratio < \' ' + clause.pelt + '\'';
        first = false;
    }

    if(clause.pegt) {
        if(!first)
            retval += ' and '

        retval += 'peratio > \' ' + clause.pegt + '\'';
        first = false;
    }

    if(clause.fpelt) {
        if(!first)
            retval += ' and '

        retval += 'forwardpe < \' ' + clause.fpelt + '\'';
        first = false;

    }

    if(clause.fpegt) {
        if(!first)
            retval += ' and '

        retval += 'forwardpe > \' ' + clause.fpegt + '\'';
        first = false;

    }

    if(clause.divyieldgt) {
        if(!first)
            retval += ' and '

        retval += 'dividendyield  >  \' ' + clause.divyieldgt + '\'';
        first = false;

    }

    if(clause.divyieldlt) {
        if(!first)
            retval += ' and '

        retval += 'dividendyield  >  \' ' + clause.divyieldlt + '\'';
        first = false;

    }


    if(clause.evbyebitdalt) {
        if(!first)
            retval += ' and '

        retval += 'enterprisevalue/ebitda  >  \' ' + clause.evbyebitdalt + '\'';
        first = false;

    }

    if(clause.evbyebitdagt) {
        if(!first)
            retval += ' and '

        retval += 'enterprisevalue/ebitda  >  \' ' + clause.evbyebitdagt + '\'';
        first = false;

    }

    if(clause.week52lowdistancepercentslt) {
        if(!first)
            retval += ' and '

        retval += ' (((previousclose - low52) * 100) / low52)  <  \' ' + clause.week52lowdistancepercentslt  + '\'';
        first = false;

    }

    if(clause.pricetobooklt) {
        if(!first)
            retval += ' and '

        retval += 'pricetobook  <  \' ' + clause.pricetobooklt + '\'';
        first = false;

    }

    if(clause.debttoequitylt) {
        if(!first)
            retval += ' and '

        retval += 'debttoequity  <  \' ' + clause.debttoequitylt + '\'';
        first = false;

    }

    if(clause.marketcaplt) {
        if(!first)
            retval += ' and '

        retval += 'marketcap  <  \' ' + clause.marketcaplt + '\'';
        first = false;

    }

    if(clause.marketcapgt) {
        if(!first)
            retval += ' and '

        retval += 'marketcap  >  \' ' + clause.marketcapgt + '\'';
        first = false;

    }

    if(clause.peglt) {
        if(!first)
            retval += ' and '

        retval += 'peg  <  \' ' + clause.peglt + '\'';
        first = false;

    }

    if(clause.evtorevenuelt) {
        if(!first)
            retval += ' and '

        retval += 'evtorevenue  <  \' ' + clause.evtorevenuelt + '\'';
        first = false;

    }


    retval += ')';
    return retval;
}

function genFilterClause(conjunctions) {
    var retval = '';
    var first = true;

    if (conjunctions && conjunctions.constructor === Array && conjunctions.length === 0)
    {
        return '';
    }

    conjunctions.forEach(async (element) => {
        if(first) {
            retval +=  processClause(element);
            first = false;
        }  else {
            retval += ' or ' +  processClause(element);
        }
    });

    return '(' + retval + ')';
}


function genSortClause(freq) {

    var retval = '';
    var first = true;
    if(freq.sort) {

        freq.sort.forEach(async (element) => {
            if(!(element in sortclausedict)) {
                throw 'Invalid entry';
            }

            if(first) {
                retval +=  sortclausedict[element];
                first = false;
            }  else {
                retval += ' , ' +  sortclausedict[element];
            }
        });
    }

    return retval;

}

function genConjunctions(filters) {
    var conjns = {};
    console.log('/genConjunctions ', filters.length);

    if(filters.length > 0)
    for (var i = 0, len = filters.length; i < len; i++) {

        var filter = filters[i];
        var filtergrp = conjns[filter.filtergroup];
        console.log(conjns);

        if(filtergrp) { 
            filtergrp[filter.filtername] = filter.filtervalue;
        } else {
            var newgrp = {};
            newgrp[filter.filtername] = filter.filtervalue;
            console.log(conjns);
            conjns[filter.filtergroup] = newgrp;
            console.log(conjns);

        }
    }

    var conjunctions = []

    Object.keys(conjns).forEach(async function(key) {
        conjunctions.push(conjns[key]);
    });

    return conjunctions;

}

async function  insertConjunctions(requestid, conjunctions, dbclient) {

    await db.deleteFilters(requestid, dbclient);
    var filtergroup = 1;

    conjunctions.forEach(async (element) => {
        Object.keys(element).forEach(async function(key) {
            var val = element[key];
            try {
                console.log(requestid, key, val);
                await db.insertRequestFilter(requestid, key, val, filtergroup, dbclient);
            }catch(err) {
                console.log(err);
            }
        });

        filtergroup++;
    });

}


async function getfiltersort(req, dbclient)
{
    console.log('/getfiltersort 1', req.query);

    try {
        var tickers = await logical.getTickers(req.query.requestid, dbclient);
        await Promise.all(tickers.map(async (ticker) => {
                await logical.updateStockRecord(ticker.ticker, sreqconfig, dbclient);
        }));
        console.log('/getfiltersort 2', req.query);

        var filters = await db.getFiltersForRequest(req.query.requestid, dbclient);

        var conjunctions = genConjunctions(filters);


        console.log('/getfiltersort 5', conjunctions);

        var filterclause = genFilterClause(conjunctions);
        console.log('/getfiltersort 6', filterclause);

        var rows = await logical.queryRequest(req.query.requestid, filterclause, '',  dbclient);

        console.log('/getfiltersort 7', rows.length, conjunctions);

        var op = {};
        op['requestid'] = req.query.requestid;
        op['stocks'] = rows;
        op['conjunctions'] = conjunctions;
        op['filterclause'] = filterclause;

        return op;

    }catch(err) {
        console.log(err);
    }
}

async function postfiltersort(req, dbclient) {
    var filterclause = genFilterClause(req.body.conjunctions);
    console.log(filterclause);

    insertConjunctions(req.body.requestid, req.body.conjunctions, dbclient);

    var sortclause = genSortClause(req.body);
    if(sortclause != '') {
        sortclause = ' order by ' + sortclause;
    }
    console.log(sortclause);

    try {
        var tickers = await logical.getTickers(req.body.requestid, dbclient);
        await Promise.all(tickers.map(async (ticker) => {
                await logical.updateStockRecord(ticker.ticker, sreqconfig, dbclient);
        }));

        var rows = await logical.queryRequest(req.body.requestid, filterclause, sortclause, dbclient);
        console.log('rows are:', rows);

        var op = {};
        op['requestid'] = req.body.requestid;
        op['stocks'] = rows;
        op['conjunctions'] = req.body.conjunctions;
        op['filterclause'] = filterclause;

        return op;

    }catch(err) {
        console.log(err);
    }

}

async function deletefilters(req, dbclient) {

    try {
        await db.deleteFilters(req.body.requestid, dbclient);

        var tickers = await logical.getTickers(req.body.requestid, dbclient);
        await Promise.all(tickers.map(async (ticker) => {
                await logical.updateStockRecord(ticker.ticker, sreqconfig, dbclient);
        }));

        var rows = await logical.queryRequest(req.body.requestid, '', '', dbclient);
        console.log('rows are:', rows);

        var op = {};
        op['requestid'] = req.body.requestid;
        op['stocks'] = rows;
        op['filterclause'] = '';
        return op;

    }catch(err) {
        console.log(err);
    }

}

module.exports.getfiltersort = getfiltersort;
module.exports.genSortClause = genSortClause;
module.exports.insertConjunctions = insertConjunctions;
module.exports.postfiltersort = postfiltersort;
module.exports.deletefilters = deletefilters;
