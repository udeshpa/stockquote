
const session = require('express-session');
const redis = require('redis');

const TWO_HOURS = 1000 * 60 * 60 * 2;
const {
    REDIS_HOST = 'localhost',
    REDIS_PORT = 6379,
    NODE_ENV = 'development',
    SESSION_NAME = 'sid',
    SESSION_SECRET = 'sssh quiet',
    SESSION_LIFETIME = TWO_HOURS
 } = process.env


const redisclient  = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
    ttl : 260
});

redisclient.on('error', function(err) {
    console.log('Redis error: ' + err);
});

const db = require('./frontenddb');
const RedisStore = require('connect-redis')(session);

const IN_PROD = NODE_ENV === 'production'

function setSession(app){

    console.log('Inside loginsession ', REDIS_HOST, REDIS_PORT);

    app.use(session( {
        store: new RedisStore({ client: redisclient}),
        name : SESSION_NAME,
        resave : false,
        saveUninitialized : false,
        secret : SESSION_SECRET,
        cookie: {
            maxAge : SESSION_LIFETIME,
            sameSite : true,
            secure : true
        }
    }));
}

const redirectLogin = (req, resp, next) => {
    if(!req.session.user) {
        resp.redirect('/');
    } else {
        next();
    }
}

const redirectSubscribeOrMain = async function (req, res, next, client){
    console.log('Inside redirectSubscribeOrMain');
    if(req.session.user) {
        console.log('Inside redirectSubscribeOrMain 1');
        try {
            var subscription = await db.getSubscription(req.session.user.userid, client);
            if(subscription) {
                console.log(subscription);
                return res.redirect('/main');
            }
            else {
                console.log('No subscription here');
                return res.redirect('/subscribe');
            }
        }catch(err) {
            console.log(err);
            return res.redirect('/subscribe');
        }
    } else {
        next();
    }
}

const redirectLoginOrSubscribe = async function (req, res, next, client){
    if(!req.session.user) {
        console.log('No User record in session');
        return res.redirect('/');
    }

    console.log('User record found in session', req.session.user );

    try {
        var subscription = await db.getSubscription(req.session.user.userid, client);
        console.log(subscription);
        if(!subscription) {
            console.log('No subscription');
            return res.redirect('/subscribe');
        }

        console.log('User subscribed');
    }catch(err) {
        console.log(err);
        return res.redirect('/subscribe');
    }

    next();

}

const x = "abc";
module.exports = {
    setSession : setSession,
    redirectLogin : redirectLogin,
    redirectLoginOrSubscribe : redirectLoginOrSubscribe,
    redirectSubscribeOrMain : redirectSubscribeOrMain,
    x:  x
}



