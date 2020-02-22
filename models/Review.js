const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Review = db.define('review', {
    rating: {
        type: Sequelize.STRING
    },
    recommend: {
        type: Sequelize.STRING
    },
    title: {
        type: Sequelize.STRING
    },
    facultydesc: {
        type: Sequelize.STRING,
    },
    facilitydesc: {
        type: Sequelize.STRING
    },
    feedbackdesc: {
        type: Sequelize.STRING
    },
    reviewschoolname: {
        type: Sequelize.STRING
    },
});// delete table in SQL workbench after changing this -dom 5/6/2019
module.exports = Review;
