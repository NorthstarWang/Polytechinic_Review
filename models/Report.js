const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/*
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Report = db.define('report', {
title:{
type:Sequelize.STRING
},
description:{
type:Sequelize.STRING
},
category:{
type:Sequelize.STRING
},
createdBy:{
type:Sequelize.INTEGER
},
createdByName:{
type:Sequelize.STRING
},
ScreenShotURL:{
type:Sequelize.STRING
},
dateSub:{
type:Sequelize.STRING
},
dateTime:{
type:Sequelize.DATE
}
,
status:{
type:Sequelize.STRING
},
closedBy:{
type:Sequelize.INTEGER
},
closedByName:{
type:Sequelize.STRING
},
closedOn:{
type:Sequelize.STRING
},
closedTime:{
type:Sequelize.DATE
},
closingComment:{
type:Sequelize.STRING
}
});
module.exports = Report;