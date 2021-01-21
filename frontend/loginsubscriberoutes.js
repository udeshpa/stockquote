const db = require('./frontenddb');
const api = require('./paypalapi');
const config = require('config');
const path = require('path');
const login = require('./loginsession');

const {
    GOOGLE_SIGNIN_CLIENT_ID = ''
} = process.env


module.exports = function(app){

    app.get('/', login.redirectSubscribeOrMain, function (req, res) {
        console.log(req.session);
        res.sendFile('index.html', { root: path.join(__dirname, 'public') });
        return;
    });

    app.post('/login', login.redirectSubscribeOrMain, async function (req, res) {
        dbclient = req.app.get('dbclient');

        console.log('Inside /login')
        try {
            var ret = await verify(req.body.idtoken);
            console.log(ret);
            req.session.user = ret;

            try {
                var user = await db.getUserById(ret.userid, dbclient);
                if(!user) {
                    console.log(user);
                    await db.insertUserRecord(ret.userid, ret.given_name, ret.family_name, dbclient);
                }
            }
            catch (err) {
                console.log(err);
                res.sendFile('subscribe.html', { root: path.join(__dirname, 'public') });
                return;
            }
            //Simply redirect to main. Subscription check will happen in login.redirectLoginOrSubscribe
            res.redirect('main');

        } catch(error) {
            console.log(error);
            //res.redirect('/error')
        }
    });


    app.get('/subscribe', login.redirectLogin, function(req, res) {
        console.log("In home" ,     req.session.user);
        res.sendFile('subscribe.html', { root: path.join(__dirname, 'public') });
    });


    app.post('/subscribe', login.redirectLogin, async function(req, res) {
        console.log("In subscribe" , req.session.user);
        console.log('subscriptionid : ' + req.body.subscriptionid);

        var accesstoken = api.generateAccessToken();
        console.log(accesstoken);

        try {
            var subscr = await api.checkSubscription(req.body.subscriptionid);
            console.log(subscr);
        } catch(err) {
            console.log('err is: ' + err);
            res.sendFile('subscribe.html', { root: path.join(__dirname, 'public') });
            return;
        }

        try {

            var s = await db.insertSubscriptionRecord(subscr.id, subscr.start_time,
                subscr.plan_id, subscr.auto_renewal, req.session.user.userid, subscr.status, dbclient);
        } catch(err) {
            console.log(err);
        }

        res.sendFile('main.html', { root: path.join(__dirname, 'public') });
        return;
    });

    app.post('/logout', login.redirectLogin, (req, res) => {

        console.log('in /logout ', SESSION_NAME, req.session);

        req.session.destroy(err => {
            if(err)
            {
                res.sendFile('subscribe.html', { root: path.join(__dirname, 'public') });
                return;
            }
        });

        res.clearCookie(SESSION_NAME);
        res.redirect('/');
    });

}

//This is for verifying the goole token.

const {OAuth2Client} = require('google-auth-library');

const client = new OAuth2Client(GOOGLE_SIGNIN_CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_SIGNIN_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    console.log(payload);

    var ret = {
        given_name :  payload.given_name,
        family_name : payload.family_name,
        userid : payload.sub
    };

    return ret;
}



