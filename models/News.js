const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const News = db.define('news', {
	content: {
		type: Sequelize.STRING
	},
	tag: {
		type: Sequelize.STRING
	},
	post_date: {
		type: Sequelize.DATE
	},
	update_date: {
		type: Sequelize.DATE
	},
	comment: {
		type: Sequelize.STRING
	},
	like: {
		type: Sequelize.INTEGER
	},
	title: {
		type: Sequelize.STRING
	},
});
module.exports = News;
