const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Profanities = db.define('profanities', {
    profanities: {
        type: Sequelize.STRING
    },
});// delete table in SQL workbench after changing this -dom 5/6/2019
module.exports = Profanities;
