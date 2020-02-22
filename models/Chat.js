const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Chat = db.define('chat', {
	friend: {
		type: Sequelize.STRING
	},
	record: {
		type: Sequelize.STRING
	},
});

module.exports = Chat;
