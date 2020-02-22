const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const EventMembers = db.define("EventMembers", {
  eventid: {
    type: Sequelize.INTEGER
  },
  uid: {
    type: Sequelize.INTEGER
  },
  fname: {
    type: Sequelize.STRING
  },
  lname: {
    type: Sequelize.STRING
  },
  username: {
    type: Sequelize.STRING
  },
  title: {
    type: Sequelize.STRING
  },
  date: {
    type: Sequelize.DATE
  },
  status: {
    type: Sequelize.STRING
  }
});
module.exports = EventMembers;
