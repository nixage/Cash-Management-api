const express = require('express');
const bodyParser = require("body-parser");
const session = require("express-session")

const {authRouter} = require('./auth_route/auth.router');

const {homeRouter} = require('./home_route/home.router');

const {financeRouter} = require('./finance_route/finance.router')

const passport = require('passport');
const {initialize} = require('./passport/passport.config')

const server = express();
const jsonParser = bodyParser.json();

const path = require('path');


/* ===========================SERVER USE=========================== */
// server.use(express.static(__dirname + '/dist/user-system'));
initialize();
server.use(bodyParser.urlencoded({extended: false}))
server.use(jsonParser);

server.use(session({
  secret: 'keyvalue',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 5184000000
  }
}))

server.use(passport.initialize())
server.use(passport.session())

server.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);


  // Pass to next layer of middleware
  next();
});
/* ================================================================ */
server.use('/public/images/user-icon', express.static(path.dirname(process.env.NODE_PATH) + '/uploads/user-icon'))
server.use('/auth', authRouter);
server.use('/home', homeRouter);
server.use('/finance', financeRouter);


// server.get("/*", function (req, res) {
//   res.sendFile(path.join(__dirname + '/dist/user-system/index.html'))
// });

// server.listen(process.env.PORT || 3001); 
server.listen(3001, function () {
  console.log('Example app listening on port 3001');
});