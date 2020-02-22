const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Faculty=db.define('faculty',{
name:{
type:Sequelize.STRING
},
polytechnicName:{
type:Sequelize.STRING
},
polytechnicID:{
type:Sequelize.INTEGER
}
})

module.exports=Faculty