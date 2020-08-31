const mysqlConnection = require('../database/database');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

function initialize(){
    const initialize = function(userlogin, password, done){
        if (!userlogin || !password){ return done(null, false)}
      
        const select = `select * from users where login=?`;
        mysqlConnection.query(select, [userlogin], (err, result)=>{
            if (err){
                return done(null, false, {msg: 'Server error, try again later'})
            }
            if(!result.length){
                return done(null, false, {msg: 'Invalid login or password'})
            }
            if(password !== result[0].password){
                return done(null, false, {msg: 'Invalid login or password'})
            }
            const user = {
                id: result[0].id.toString(),
                firstName: result[0].first_name,
                lastName: result[0].last_name,
            }
            return done(null, user)
            })
    }
    passport.use(new LocalStrategy({
        usernameField:"login",
        passwordField: "password"
    }, initialize))
    passport.serializeUser(function(user, done){
        done(null, user.id)
    })
    passport.deserializeUser(function(id, done){
        const select = `select * from users where id=?`;
        mysqlConnection.query(select, [id], (err, result)=>{
            if(err){return done(err, null)}
            if(result.length != 0){
                return done(err, result[0])
            }else{
                return done(err, null)
            }
        })
    })
}

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next()
    }
    return res.json({msg: 'Unauthorized'})
}

module.exports = {
    initialize: initialize,
    isAuthenticated: isAuthenticated
}
  