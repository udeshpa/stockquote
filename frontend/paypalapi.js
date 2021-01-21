var Client = require('node-rest-client').Client;
var accesstoken = null;

async function getAccessToken() {

    return new Promise(async (resolve, reject) => {
        if(accesstoken === null)
        {
            try {
                accesstoken = await generateAccessToken();
            } catch(err) {
                console.log(err);
                reject(err);
            }
        }

        resolve(accesstoken);
    });
}

async function loadProducts(productid) {

    var url = 'https://api.sandbox.paypal.com/v1/catalogs/products/' + productid;

    console.log('Inside  loadProducts ' + url);
    var client = new Client();
    var args = {
        data: { },
        headers: { "Content-Type": "application/json", "Authorization" : "Bearer " + await getAccessToken() }
    };

    let promise = await new Promise((resolve, reject) => {
            client.get(url, args, function (data, response) {
                // parsed response body as js object
                console.log(response.statusCode);
                if(response.statusCode != 200 ){
                    reject(response.statusCode);
                    return;
                }

                resolve(data);
            });
    });

    return promise;
}

async function loadPaymentPlanDetails(planid) {

    var url = 'https://api.sandbox.paypal.com/v1/billing/plans/' + planid;

    console.log('Inside  loadPaymentPlanDetails ' + url);
    var client = new Client();
    var args = {
        data: { },
        headers: { "Content-Type": "application/json", "Authorization" : "Bearer " + await getAccessToken() }
    };

    let promise = await new Promise((resolve, reject) => {
            client.get(url, args, function (data, response) {
                // parsed response body as js object
                console.log(response.statusCode);
                if(response.statusCode != 200 ){
                    reject(response.statusCode);
                    return;
                }

                resolve(data);
            });
    });

    return promise;

}


async function loadPaymentPlans() {

    var url = 'https://api.sandbox.paypal.com/v1/billing/plans';

    console.log('Inside  loadPaymentPlans ' + url);
    var client = new Client();
    var args = {
        data: { },
        headers: { "Content-Type": "application/json", "Authorization" : "Bearer " + await getAccessToken() }
    };

    let promise = await new Promise((resolve, reject) => {
            client.get(url, args, function (data, response) {
                // parsed response body as js object
                console.log(response.statusCode);
                if(response.statusCode != 200 ){
                    reject(response.statusCode);
                    return;
                }

                resolve(data);
                console.log(data);
            });
    });

    return promise;

}

async function checkSubscription(subscrid) {

    var url = 'https://api.sandbox.paypal.com/v1/billing/subscriptions/' + subscrid;

    console.log('Inside  checkSubscription ' + url);
    var client = new Client();
    var args = {
        data: { },
        headers: { "Content-Type": "application/json", "Authorization" : "Bearer " + await getAccessToken() }
    };

    let promise = await new Promise((resolve, reject) => {
            client.get("https://api.sandbox.paypal.com/v1/billing/subscriptions/" + subscrid, args, function (data, response) {
                // parsed response body as js object
                console.log(response.statusCode);
                if(response.statusCode != 200 ){
                    reject(response.statusCode);
                    return;
                }

                resolve(data);
            });
    });

    return promise;
}



async function generateAccessToken() {
    var options_auth = { user: 'AU0NfwKt1gfolpG0iNv-rST-3lBWL33AGGSDM5Styrthl4w891F6UgXmT29JE-ghooxpQ-SAWONuzFOi', password: 'EGbHsJckNseSi4YfW_MCYAffKLbMCD3lLdiaX71h1_KPDplB2z7BxvcLkTaejXLtlCwA2LDfND-YVUKx' };
    var client = new Client(options_auth);
    var args = {
        data: { 'grant_type' : 'client_credentials'},
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json", "Accept-Language": "en_US"}
    };

    let promise = await new Promise((resolve, reject) => {

        client.post("https://api.sandbox.paypal.com/v1/oauth2/token", args, function (data, response) {
            // parsed response body as js object
            console.log(response.statusCode);
            if(response.statusCode != 200 ){
                reject(response.statusCode);
                return;
            }

            if(data.access_token != null) {
                resolve(data.access_token);
                return;
            }

            console.log(data);
            reject('access token null');

        // raw response
        });

    });

    return promise;
}

module.exports.generateAccessToken = generateAccessToken;
module.exports.checkSubscription = checkSubscription;
module.exports.loadPaymentPlans = loadPaymentPlans;
module.exports.loadPaymentPlanDetails = loadPaymentPlanDetails;
module.exports.loadProducts = loadProducts;
module.exports.getAccessToken = getAccessToken;
