const https = require("https");

const {
  BACKENDBASEURL = 'localhost',
  BACKENDPORT = 4001
} = process.env

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

function processGETrequest(options, resolve, reject) {
  try {

    options['method'] = 'GET';
    options['timeout'] = 600000;

    //making the https get call
    var getReq = https.request(options, function(res) {
      console.log("\nstatus code: ", res.statusCode);

      var body = '';
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function() {
        console.log('Body: ' + body);
        resolve(body);
      });
    });

    getReq.on('error', function(err){
        console.log("Error: ", err);
        reject(err.message);
    });

    //end the request
    getReq.end();
  }catch(err) {
    console.log(err);
  }
}

function processPOSTrequest(options, postData, resolve, reject) {

  try {
    options['method'] = 'POST';
    options['timeout'] = 600000;

    // request object
    var req = https.request(options, function (res) {
        console.log('Status: ' + res.statusCode);
        console.log('Headers: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function (chunk) {
          body += chunk;
        });
        res.on('end', function() {
          console.log('Body: ' + body);
          resolve(body);
        });
    });
  }catch(err) {
  console.log(err);
  }

  req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
  reject(e.message);
  });

  //send request witht the postData form
  req.write(postData);
  req.end();

}

async function getIndexes(sqconfig) {
  return new Promise((resolve, reject)=>{

    var options = {
      host :  BACKENDBASEURL,
      port : BACKENDPORT,
      path : sqconfig.indexurl
    }
    processGETrequest(options, resolve, reject);

  });

}


async function deleteRequest(requestid, sqconfig) {
  console.log('Inside proxy.deleteRequest ' +  requestid);
  return new Promise((resolve, reject)=>{

    var payload = {
      'requestid' : requestid
    }
    var postData = JSON.stringify(payload);
    console.log(postData);

    // request option
    var options = {
      host: BACKENDBASEURL,
      port: BACKENDPORT,
      path: sqconfig.deleterequesturl,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    processPOSTrequest(options, postData, resolve, reject);

  });
}


async function getAllFilters(sqconfig) {

  console.log('BACKENDBASEURL is ', BACKENDBASEURL);

  return new Promise((resolve, reject)=>{

        var options = {
          host :  BACKENDBASEURL,
          port : BACKENDPORT,
          path : sqconfig.allfiltersurl
      }

      processGETrequest(options, resolve, reject);
  });
}

async function updateStockQuote(tickers, indexid, userid, sqconfig) {

  return new Promise((resolve, reject)=>{

    var payload = {
      'tickers' : tickers,
      'indexid' : indexid,
      'userid' : userid
    }
    var postData = JSON.stringify(payload);
    console.log(postData);

    // request option
    var options = {
      host: BACKENDBASEURL,
      port: BACKENDPORT,
      path: sqconfig.uploadurl,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    processPOSTrequest(options, postData, resolve, reject);

  });
}

async function postFilteredStocks(reqid, conjunctions, sqconfig) {

  return new Promise((resolve, reject)=>{

    var payload = {
      'conjunctions' : conjunctions,
      'requestid' : reqid
    }
    var postData = JSON.stringify(payload);
    console.log(postData);

    // request option
    var options = {
      host: BACKENDBASEURL,
      port: BACKENDPORT,
      path: sqconfig.filtersorturl,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    console.log(options);

    processPOSTrequest(options, postData, resolve, reject)

  });
}

async function deleteFilters(reqid, sqconfig) {

  return new Promise((resolve, reject)=>{

    var payload = {
      'requestid' : reqid
    }
    var postData = JSON.stringify(payload);
    console.log(postData);

    // request option
    var options = {
      host: BACKENDBASEURL,
      port: BACKENDPORT,
      path: sqconfig.deletefiltersurl,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    console.log(options);

    processPOSTrequest(options, postData, resolve, reject)

  });
}



async function getFilteredStocks(reqid, sqconfig) {

  return new Promise((resolve, reject)=>{

    // request option
    var options = {
      host: BACKENDBASEURL,
      port: BACKENDPORT,
      path: sqconfig.filtersorturl + '?requestid=' + reqid,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    console.log(options);
    processGETrequest(options, resolve, reject);

  });
}


async function getRequests(userid, sqconfig) {

  return new Promise((resolve, reject)=>{
      var options = {
          host :  BACKENDBASEURL,
          port : BACKENDPORT,
          path : sqconfig.getrequestsurl + '?userid=' + userid
      }

      processGETrequest(options, resolve, reject);
  });

}

module.exports.updateStockQuote = updateStockQuote;
module.exports.getFilteredStocks = getFilteredStocks;
module.exports.postFilteredStocks = postFilteredStocks;
module.exports.getRequests = getRequests;
module.exports.getAllFilters = getAllFilters;
module.exports.deleteRequest = deleteRequest;
module.exports.getIndexes = getIndexes;
module.exports.deleteFilters = deleteFilters;
