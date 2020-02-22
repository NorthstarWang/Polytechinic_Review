const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/*
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Polytechnic = db.define('polytechnic', {
name:{
type:Sequelize.STRING
},
address:{
type:Sequelize.STRING
},
UserRating:{
type:Sequelize.FLOAT
}
});
module.exports = Polytechnic;