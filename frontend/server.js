const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const TWO_HOURS = 1000 * 60 * 60 * 2;
const {
    PORT = 3000,
    SESSION_LIFETIME = TWO_HOURS,
    NODE_ENVIRONMENT = 'development',
    SESSION_NAME = 'sid',
    SESSION_SECRET = 'sssh quiet'
 } = process.env

const app = express();


const IN_PROD = NODE_ENVIRONMENT === 'production'


app.use(
    bodyParser.urlencoded({
        extended : true
    })
);

app.use(session( {
    name : SESSION_NAME,
    resave : false,
    saveUninitialized : false,
    secret : SESSION_SECRET,
    cookie: {
        maxAge : SESSION_LIFETIME,
        sameSite : true,
        secure : IN_PROD,
    }
}));

const redirectLogin = (req, resp, next) => {
    if(!req.session.userId) {
        resp.redirect('/login');
    } else {
        next();
    }
}

const redirectHome = (req, resp, next) => {
    if(req.session.userId) {
        resp.redirect('/home');
    } else {
        next();
    }
}

app.get('/', (req, rsp) => {
    const {userId} = req.session;

    if(userId) {

    }

    rsp.send(`
        <h1> Welcome </h1>
        ${userId ? 
        `<a href='/login'> Login </a>
        <a href='/register'> Register </a>` : 
        `<a href='/home'> Home </a>
        <form method='post' action='/logout'>
            <button> Logout </button>
        </form>`
        }
    `);
});

app.get('/home', redirectLogin, (req, rsp) => {
    rsp.send(
        `
            <h1> HOME  </h1>
            <ul>
                <li> Name </li>
                <li> Email </li>
            </ul>
.        `
    )

});

app.get('/login', redirectHome, (req, rsp) => {
    //req.session.userId = 
    rsp.send(
        `
            <h1> Login  </h1>
            <form method='post' action='/login'>
                <input type='email' name = 'email' placeholder='email' required />
                <input type='password' name = 'password' placeholder='Password' required />
                <input type='submit' />

            </form>
            <a href='/register'> Register </a>
        `
    )
});
app.get('/register', redirectHome, (req, rsp) => {
    rsp.send(
        `
            <h1> Login  </h1>
            <form method='post' action='/register'>
                <input type='email' name = 'email' placeholder='email' required />
                <input type='email' name = 'email' placeholder='email' required />
                <input type='password' name = 'password' placeholder='Password' required />
                <input type='submit' />

            </form>
            <a href='/login'> Login </a>

        `
    )
});

const users =  [
    {id : 1, name: 'Alex', email: 'alex@gmail.com', password: 'secret'},
    {id : 2, name: 'Max', email: 'max@gmail.com', password: 'secret'},
    {id : 3, name: 'Haggard', email: 'haggard@gmail.com', password: 'secret'}

]
app.post('/login', redirectHome, (req, res) => {
    const {email, password } = req.body;
    if(email && password) {
        const user = users.find(   user => user.email === email && user.password === password)
        if(user) {
            req.session.userId = user.id;
            return res.redirect('/home');
        }
    }

    res.redirect('/login');
});

app.post('/register', redirectHome, (req, res) => {

});

app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        return res.redirect('/home');   
    });

    res.clearCookie(SESS_NAME);
    res.redirect('/login');
});

app.listen(PORT, ()=> {
    console.log(`http://localhost:${PORT}`)
});