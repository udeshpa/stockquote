

async function insertUserRecord(userid, fname, lname, client) {
    console.log('client is:', client);
    return new Promise((resolve, reject) => {
        client.query("INSERT INTO epuser (userid, fname, lname) values($1, $2, $3) RETURNING *",
        [userid, fname, lname],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows[0]);
            }
            else
                reject(err);
        });
    });

}

async function getUserById(userid, client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT userid, fname, lname from  epuser where userid = $1",
        [userid],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows[0]);
            }
            else
                reject(err);
        });
    });
}

async function getOrInsertPlanId(ppplanid, planname, productid, client) {

    return new Promise((resolve, reject) => {
        client.query("INSERT INTO paymentplan (paypalplanid, planname, productid) " +
        "values ($1, $2, $3) ON CONFLICT (paypalplanid) DO UPDATE SET planname = paymentplan.planname RETURNING *",
        [ppplanid, planname, productid],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows[0]);
            }
            else
                reject(err);
        });
    });
}

async function getOrInsertProduct(prodctid, productname, description, imageurl, homeurl, client) {

    return new Promise((resolve, reject) => {
        client.query("INSERT INTO product (productid, prodname, description, imageurl, homeurl) " +
        "values ($1, $2, $3, $4, $5) ON CONFLICT (productid) DO UPDATE SET description = product.description RETURNING *",
        [prodctid, productname, description, imageurl, homeurl],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows[0]);
            }
            else
                reject(err);
        });
    });


}

async function getSubscription(userid, client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT subsriptionid, paypalsubscriptionid, starttime, autorenewal, userid, substatus, planid " +
        " from  subscription where userid = $1",
        [userid],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows[0]);
            }
            else
                reject(err);
        });
    });

}

async function getPaymentPlans(client) {
    return new Promise((resolve, reject) => {
        client.query("SELECT paypalplanid, planname, productid FROM public.paymentplan;",
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

async function insertSubscriptionRecord(paypalsubscriptionid, starttime, planid, autorenewal, userid, status, client) {
    return new Promise((resolve, reject) => {
        client.query("INSERT INTO public.subscription(paypalsubscriptionid, starttime, planid, autorenewal, userid, substatus)" +
        " values($1, $2, $3, $4, $5, $6) RETURNING *",
        [paypalsubscriptionid, starttime, planid, autorenewal, userid, status],
        (err, res) =>  {
            if(!err) {
                resolve(res.rows[0]);
            }
            else
                reject(err);
        });
    });
}


module.exports.insertUserRecord = insertUserRecord;
module.exports.getUserById = getUserById;
module.exports.insertSubscriptionRecord = insertSubscriptionRecord;
module.exports.getOrInsertProduct = getOrInsertProduct;
module.exports.getOrInsertPlanId = getOrInsertPlanId;
module.exports.getSubscription = getSubscription;
module.exports.getPaymentPlans = getPaymentPlans;