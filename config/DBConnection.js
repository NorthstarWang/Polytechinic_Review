const mySQLDB = require('./DBConfig');
const user = require('../models/User');
const review = require('../models/Review');
const directory = require('../models/SchoolInfo');
const messenger = require('../models/Messenger');
const news = require('../models/News');
const chat = require('../models/Chat');
const event = require('../models/Event');
const schoolinfo = require('../models/SchoolInfo');
const modules = require('../models/Module');

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database Connected');
        })
        .then(() => {
            /*
            Defines the relationship where a user has many videos.
            In this case the primary key from user will be a foreign key
            in video.
            */
            user.hasMany(event);
            user.hasMany(news);
            user.hasMany(messenger);
            user.hasMany(chat);
            user.hasMany(review)
            user.hasMany(schoolinfo)
            mySQLDB.sync({ // Creates table if none exists
                force: drop
            }).then(() => {
                console.log('Create tables if none exists')
            }).catch(err => console.log(err))
        })
        .catch(err => console.log('Error: ' + err));
};

module.exports = { setUpDB }