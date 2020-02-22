const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const SchoolInfo = db.define('schoolinfo', {
    schoolname: {
        type: Sequelize.STRING 
    },
    schoolname2: {
        type: Sequelize.STRING 
    },
    basicinfo: {
        type: Sequelize.STRING
    },
    faculty: {
        type: Sequelize.STRING
    },
    website: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING,
    },
    phone: {
        type: Sequelize.STRING
    },
    address: {
        type: Sequelize.STRING
    },
    imgurl: {
        type: Sequelize.STRING 
    },
    isdeleted: {
        type: Sequelize.STRING 
    }
});
module.exports = SchoolInfo;
