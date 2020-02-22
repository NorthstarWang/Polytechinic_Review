const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Module = db.define('module', {
        name:{
        type:Sequelize.STRING
        },
        category:{
        type:Sequelize.STRING
        },
        polytechnic:{
        type:Sequelize.STRING
        },
        polytechnicID:{
        type:Sequelize.STRING
        },
        userRating:{
        type:Sequelize.FLOAT
        }
});
module.exports = Module;
