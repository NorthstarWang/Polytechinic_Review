const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Event = db.define('event', {
	title: {
		type: Sequelize.STRING
	},
	email: {
		type: Sequelize.STRING
	},
	phone: {
		type: Sequelize.STRING
	},
	detail: {
		type: Sequelize.STRING(2000)
	},
	designation: {
		type: Sequelize.STRING
	},
	address: {
		type: Sequelize.STRING
	},
	organiser: {
		type: Sequelize.STRING
	},
	number: {
		type: Sequelize.INTEGER
	},
	date: {
		type: Sequelize.DATE
	},
});
module.exports = Event;
