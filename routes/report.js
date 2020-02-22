const express = require("express");
const router = express.Router();
const alertMessage = require("../helpers/messenger");
const path = require("path");
const fs = require("fs");
const upload = require("../helpers/screenshotUpload");
const ensureAuthenticated = require("../helpers/auth");
const LocalStrategy = require("passport-local").Strategy;
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const op = Sequelize.Op;
const nodemailer = require("nodemailer");
const ScreenshotUpload=require("../helpers/screenshotUpload");

const User = require("../models/User");
const Report = require("../models/Report");
const multer = require("multer");
const uploads = multer({ dest: path.join(__dirname, "/../public/screenshotUploads/") });

router.get("/reports/:id",/*ensureAuthenticated,*/(req, res) => {
  Report.findOne({ where: { id: req.params.id } }).then((report) => {
    if (report) {
      res.render("report/report", { report: report });
    }
    else {
      alertMessage(res, "failure", "Couldn't find report", "fas fa-sign-in-alt", true);
      res.redirect("/reports");
    }
  }).catch(err => console.log(err))
})

router.get("/closeReport/:id", (req, res) => {
  Report.findOne({ where: { id: req.params.id } }).then((report) => {
    if (report) {
      res.render("report/closeReport", { report: report.id });
    }
    else {
      alertMessage(res, "failure", "Couldn't find report", "fas fa-sign-in-alt", true);
      res.redirect("/reports");
    }
  })
})


router.get('/MessageReport/:id/:report', (req, res) => {
  User.findOne({ where: { id: req.params.id } }).then((user) => {
    if (user) {
      report = req.params.report;
      res.render("report/reportMessage", { user: user, report: report })
    }
    else {
      alertMessage(res, 'failed', "Couldn't find user", 'fas fa-sign-in-alt', true);
      res.redirect("/report/reports/" + req.params.report)
    }
  })
})

router.get("/reportCreate",/*ensureAuthenticated,*/(req, res) => {
  res.render("report/createReports")
})

router.post("/reportCreate", (req, res) => {
  let title = req.body.title;
  let description = req.body.description;
  let category = req.body.category;
  let createdBy = req.user === undefined ? 0 : req.user.id;
  let createdByName = req.user === undefined ? "Non-registered user" : req.user.username;
  let dateSub = moment(new Date()).format("DD/MM/YYYY");
  let dateTime = moment(new Date())
  let ScreenShotURL = req.body.ScreenShotURL === undefined ? "#" : req.body.ScreenShotURL;
  let status = "open";
  let closedBy = 0;
  let closedByName = "NA";
  let closedOn = "NA";
  Report.create({ title, description, category, createdBy, createdByName, dateSub, dateTime, ScreenShotURL, status, closedBy, closedByName, closedOn }).then(report => {
    alertMessage(res, 'success', report.id + 'added', 'fas fa-sign-in-alt', true);
    res.redirect('/report/reports/' + report.id);
  }).catch(err => console.log(err));
})

router.post("/Report", (req, res) => {
  let openClosed = req.body.IncludeClosed;
  let closeOpen = req.body.ExcludeOpen;
  let SearchBy = req.body.SearchBy;
  if (SearchBy == "category") {
    let value = req.body.category;
    if (openClosed == "1") {
      if (closeOpen == "1") {
        open = "yes";
        Report.findAll({ where: { category: value, status: "closed" } }).then((reports) => {
          res.render("report/listReports", { reports: reports, closed: open, names: " Search by Category for closed reports" });
        })
      }
      else {
        open = "yes";
        Report.findAll({ where: { category: value } }).then((reports) => {
          res.render("report/listReports", { reports: reports, closed: open, names: " Search by Category for all reports" });
        })
      }
    }
    else {
      Report.findAll({ where: { category: value, status: "open" } }).then((reports) => {
        res.render("report/listReports", { reports: reports, names: " Search by Category for reports" });
      })
    }
  }
  else if (SearchBy == "submitted") {
    let value = req.body.submitted;
    console.log(moment(new Date()).format("DD/MM/YYYY").toString());
    if (openClosed == "1") {
      if (closeOpen == "1") {
        open = "yes";
        Report.findAll({ where: { dateSub: value, status: "closed" } }).then((reports) => {
          res.render("report/listReports", { reports: reports, closed: open, names: " Search by Date Submitted for closed reports" });
        })
      }
      else {
        open = "yes";
        Report.findAll({ where: { dateSub: value } }).then((reports) => {
          res.render("report/listReports", { reports: reports, closed: open, names: " Search by Date Submitted for all reports" });
        })
      }
    }
    else {
      Report.findAll({ where: { dateSub: value, status: "open" } }).then((reports) => {
        res.render("report/listReports", { reports: reports, names: " Search by Date Submitted for reports" });
      })
    }
  }
  else if (SearchBy == "closedOn") {
    if (openClosed == "1") {
      open = "yes";
      let value = req.body.submitted;
      Report.findAll({ where: { closedOn: value, status: "closed" } }).then((reports) => {
        res.render("report/listReports", { reports: reports, closed: open, names: " Search by Date Closed for closed reports" });
      })
    }
    else {
      alertMessage(res, 'failure', "Invalid value", 'fas fa-sign-out-alt', true);
      res.redirect("report/listReports");
    }
  }
  else if (SearchBy == "") {
    if (openClosed == "1") {
      if (closeOpen == "1") {
        open = "yes";
        Report.findAll({ where: { status: "closed" } }).then((reports) => {
          res.render("report/listReports", { reports: reports, closed: open, names: " Search for closed reports" });
        })
      }
      else {
        open = "yes";
        Report.findAll().then((reports) => {
          res.render("report/listReports", { reports: reports, closed: open, names: " Search for all reports" });
        })
      }
    }
    else {
      Report.findAll({ where: { status: "open" } }).then((reports) => {
        res.render("report/listReports", { reports: reports, names: " Search for reports" });
      })
    }
  }
  else {
    let value = req.body.searchInput;
    if (SearchBy == "id") {
      if (parseInt(value) != "NaN") {
        if (openClosed == "1") {
          if (closeOpen == "1") {
            open = "yes";
            Report.findAll({ where: { id: value, status: "closed" } }).then((reports) => {
              res.render("report/listReports", { reports: reports, closed: open, names: " Search by report ID for closed reports" });
            })
          }
          else {
            open = "yes";
            Report.findAll({ where: { id: value } }).then((reports) => {
              res.render("report/listReports", { reports: reports, closed: open, names: " Search by report ID for all reports" });
            })
          }
        }
        else {
          Report.findAll({ where: { id: value, status: "open" } }).then((reports) => {
            res.render("report/listReports", { reports: reports, names: " Search by report ID for reports" });
          })
        }
      }
      else {
        alertMessage(res, 'failure', "Invalid value", 'fas fa-sign-out-alt', true);
        res.redirect("/reports");
      }
    }
    else if (SearchBy == "name") {
      if (openClosed == "1") {
        if (closeOpen == "1") {
          open = "yes";
          Report.findAll({ where: { createdByName: value, status: "closed" } }).then((reports) => {
            res.render("report/listReports", { reports: reports, closed: open, names: " Search by Creator name for closed reports" });
          })
        }
        else {
          open = "yes";
          Report.findAll({ where: { createdByName: value } }).then((reports) => {
            res.render("report/listReports", { reports: reports, closed: open, names: " Search by Creator name for all reports" });
          })
        }
      }
      else {
        Report.findAll({ where: { createdByName: value, status: "open" } }).then((reports) => {
          res.render("report/listReports", { reports: reports, names: " Search by Creator name for reports" });
        })
      }
    }
    else if (SearchBy == "closedBy") {
      if (openClosed == "1") {
        open = "yes";
        Report.findAll({ where: { ClosedByName: value, status: "closed" } }).then((reports) => {
          res.render("report/listReports", { reports: reports, closed: open, names: " Search by Closer name for reports" });
        })
      }
      else {
        alertMessage(res, 'failure', "Invalid value", 'fas fa-sign-out-alt', true);
        res.redirect("/reports");
      }
    }
  }
})


router.post("/closeReport/:id",/*ensureAuthenticated,*/(req, res) => {
  Report.findOne({ where: { id: req.params.id } }).then((report) => {
    let status = "closed";
    let description = report.description;
    let category = report.category;
    let createdBy = report.createdBy;
    let dateSub = report.dateSub;
    let dateTime = report.dateTime
    let ScreenShotURL = report.ScreenShotURL;
    let closedBy = req.user === undefined ? 0 : req.user.id;
    let closedByName = req.user === undefined ? "Unavaliable" : req.user.username;
    let closedOn = moment(new Date()).format("DD/MM/YYYY");
    let closedTime = moment(new Date());
    let closingComment = req.body.closingComment;
    report.update({
      description, category, createdBy, dateSub, dateTime, ScreenShotURL, status, closedBy, closedTime, closedByName, closedOn, closingComment
    }).then(reports => {
      alertMessage(res, 'success', reports.title + "Closed", 'fas fa-sign-in-alt', true);
      res.redirect("/report/reports/" + report.id);
    })
  })
})

router.post('/uploadScreenShot', (req, res) => {
  var user = req.user === undefined ? "0" : req.user.id;
  // Creates user id directory for upload if not exist
  if (!fs.existsSync('./public/screenshotUploads/' + user)) {
    fs.mkdirSync('./public/screenshotUploads/' + user);
  }
  upload(req, res, (err) => {
    if (err) {
      res.json({ file: '/img/no-image.jpg', err: err });
    }
    else {
      if (req.file === undefined) {
        res.json({ file: '/img/no-image.jpg', err: err });
      }
      else {
        res.json({ file: `/screenshotUploads/${user}/${req.file.filename}` });
      }
    }
  });
})

router.post('/MessageReport/:id/:report', (req, res) => {
  User.findOne({ where: { id: req.params.id } }).then((user) => {
    if (user) {
      email = user.email;
      title = req.body.title;
      content = req.body.content;
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "damienchew2001@gmail.com",
          pass: "DamienChew",
        }
      })
      let info = transporter.sendMail({
        from: 'damienchew2001@gmail.com', // sender address
        to: email, // list of receivers
        subject: title, // Subject line
        text: content, // plain text body
      });
      alertMessage(res, 'success', "Message sent", 'fas fa-sign-in-alt', true);
      res.redirect("/report/reports/" + req.params.report)
    }
    else {
      alertMessage(res, 'failed', "Couldn't find user", 'fas fa-sign-in-alt', true);
      res.redirect("/report/reports/" + req.params.report)
    }
  })
})

module.exports = router;