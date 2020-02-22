const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const Messenger = db.define("messenger", {
  starred: {
    type: Sequelize.BOOLEAN
  },
  unread: {
    type: Sequelize.BOOLEAN
  },
  subject: {
    type: Sequelize.STRING
  },
  content: {
    type: Sequelize.STRING
  },
  date: {
    type: Sequelize.DATE
  },
  sender: {
    type: Sequelize.STRING
  },
  sendto: {
    type: Sequelize.STRING
  },
  attachments: {
    type: Sequelize.STRING(15000)
  }
});
module.exports = Messenger;
