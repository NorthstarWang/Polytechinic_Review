const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/

const User = db.define('user', {
    status: {
        type: Sequelize.STRING
    },
    school: {
        type: Sequelize.STRING
    },
    faculty: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },    
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    exptgraddate: {
        type: Sequelize.DATE
    },
    fname:{
        type: Sequelize.STRING
    },
    lname: {
        type: Sequelize.STRING
    }, 
    profilepic: {
        type: Sequelize.STRING
    },
    awards: {
        type: Sequelize.STRING
    },
    verified: {
        type: Sequelize.BOOLEAN
    },
    overallAdmin: {
        type: Sequelize.BOOLEAN
    }, 
    disabled: {
        type: Sequelize.BOOLEAN
    },      
});




module.exports = User;
