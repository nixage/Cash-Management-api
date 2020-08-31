const express = require('express');
const financeRouter = express.Router();
const mysqlConnection = require('../database/database');
const {isAuthenticated} = require('../passport/passport.config')

financeRouter.get("/savings", isAuthenticated, function(req, res){
    const select = `select * from savings_options`
    mysqlConnection.query(select, (err, result) => {
        if (err){
            res.status(500).json({mgs: 'Server error, try again later'})
        }
        res.json(result)
    })
})

financeRouter.get("/spends", isAuthenticated ,function(req, res){
    const select = `select * from spends_options`
    mysqlConnection.query(select, (err, result) => {
        if (err){
            res.status(500).json({mgs: 'Server error, try again later'})
        }
        res.json(result)
    })
})



module.exports = {
    financeRouter: financeRouter,
}
