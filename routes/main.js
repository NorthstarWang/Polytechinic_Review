const express = require("express");
const router = express.Router();
const alertMessage = require("../helpers/messenger");
var bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const upload = require("../helpers/imageUpload");
const ensureAuthenticated = require("../helpers/auth");
const LocalStrategy = require("passport-local").Strategy;
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const op = Sequelize.Op;
const passport = require('passport');
const nodemailer = require("nodemailer");

const User = require("../models/User");
const Polytechnic = require("../models/Polytechnic");
const Report = require("../models/Report");
const Review = require('../models/Review');
const Profanities = require('../models/Profanities');
const SchoolInfo = require('../models/SchoolInfo');
const Module = require('../models/Module');
const News = require("../models/News");
const Event = require("../models/Event");
const EventMembers = require("../models/EventMembers");
const Messenger = require("../models/Messenger");
const multer = require("multer");
const uploads = multer({ dest: path.join(__dirname, "/../public/upload/") });

router.get("/", (req, res) => {
  var reviewObject = new Array();
  var UserObject;
  User.findAll({
	}).then((User) => {
		UserObject = User;
		//console.log("User output: " + UserObject.username)
	});
  Review.findAll({
	}).then((Review) => {
      for(var i = 0; i< 3; i++){
        reviewObject.push(Review[i]);
      }
	}).catch(err => console.log(err));
  if (req.user==undefined){
   poly=[];
    SchoolInfo.findAll().then((polytechnics)=>{
    polytechnics.forEach((name)=>{
    Review.findAll({where:{reviewschoolname:name.get({plain:true}).schoolname}}).then((reviews)=>{
    total=0;
    count=0;
    reviews.forEach((review)=>{
    total+=parseInt(review.get({plain:true}).rating);
    count+=1;
    })
    avg=total/count;
    poly.push({label:name.get({plain:true}).schoolname,y:avg});
    })
    })
      res.render("index", {polytechnics:poly, reviewObject,UserObject}); // renders views/index.handlebars
    })
  }
  else{
  res.redirect("/home")
  }
});

router.get("/home", ensureAuthenticated, (req, res) => {
  var reviewObject = new Array();
  var UserObject;
  User.findAll({
	}).then((User) => {
		UserObject = User;
		//console.log("User output: " + UserObject.username)
	});
  Review.findAll({
	}).then((Review) => {
      for(var i = 0; i< 3; i++){
        console.log(Review[i]);
        reviewObject.push(Review[i]);
      }
	}).catch(err => console.log(err));
  const title = "Home";
   poly=[];
    SchoolInfo.findAll().then((polytechnics)=>{
    polytechnics.forEach((name)=>{
    Review.findAll({where:{reviewschoolname:name.get({plain:true}).schoolname}}).then((reviews)=>{
    total=0;
    count=0;
    reviews.forEach((review)=>{
    total+=parseInt(review.get({plain:true}).rating);
    count+=1;
    })
    avg=total/count;
    poly.push({label:name.get({plain:true}).schoolname,y:avg});
    })
    })
      res.render("loggedindex", {polytechnics:poly, reviewObject:reviewObject, UserObject}); // renders views/index.handlebars
    })
});

router.get("/login", (req, res) => {
  const title = "Login";
  res.render("./user/login", { title: title });
});

router.get("/preregister", (req, res) => {
  const title = "Register";
  res.render("./user/preregister", { title: title });
});

router.get("/addSchool", ensureAuthenticated, (req, res) => {
  const title = "Add School";
  res.render("./directory/addSchool", { title: title });
});

router.get("/registerTeacher", (req, res) => {
  const title = "Register";
  res.render("./user/registerTeacher", { title: title });
});

router.get("/registerStudent", (req, res) => {
  const title = "Register";
  res.render("./user/registerStudent", { title: title });
});

router.get("/registerAlumni", (req, res) => {
  const title = "Register";
  res.render("./user/registerAlumni", { title: title });
});

function checkUpdateStatus(graddate) {
  var todayDate = new Date();
  var todayMonth = todayDate.getMonth() + 1;
  var todayDay = todayDate.getDate();
  var todayYear = todayDate.getFullYear();
  var todayDateText = todayYear + "/" + todayMonth + "/" + todayDay;
  moment(graddate, "YYYY/MM/DD");
  var inputDateText = graddate;

  var inputToDate = Date.parse(inputDateText);
  var todayToDate = Date.parse(todayDateText);

  if (todayToDate > inputToDate) {
    return true;
  } else {
    return false;
  }
}

router.get("/profileStudent", ensureAuthenticated, (req, res) => {
  if (req.user.status == "Student") {
    User.findOne({
      where: {
        id: req.user.id,
        status: {
          [Op.or]: ["Student", "Alumni"]
        },
        exptgraddate: {
          [Op.ne]: null
        }
      }
    })
      .then(user => {
        if (checkUpdateStatus(user.exptgraddate)) {
          user.update({
            status: "Alumni"
          })
            .then(() => {
              res.render("user/profileStudent", {
                user: req.user
              });
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
  } else {
    res.render("user/profileStudent", {
      user: req.user
    });
  }
});

router.get("/profileTeacher/:id", (req, res) => {
    User.findOne({
      where: {
        id: req.params.id,
        status:"Teacher",
      }
    })
      .then(teacher => {
              res.render("user/profileTeacher", {
                teacher: teacher
              });
      })
      .catch(err => console.log(err));
});

router.get("/viewProfileTeacher/:id", (req, res) => {
    User.findOne({
      where: {
        id: req.params.id,
        status:"Teacher",
      }
    })
      .then(teacher => {
              res.render("user/viewProfileTeacher", {
                teacher: teacher
              });
      })
      .catch(err => console.log(err));
});

router.get("/changePassword", ensureAuthenticated, (req, res) => {
  res.render("user/changePassword", {
    user: req.user
  });
});

router.get("/deleteAccount", ensureAuthenticated, (req, res) => {
  res.render("user/deleteAccount", {
    user: req.user
  });
});

// User register URL using HTTP post => /user/register
router.post("/deleteAccount", (req, res) => {
  let errors = [];

  let success_msg = "";

  User.findOne({
    where: {
      id: req.user.id
    }
  }).then(user => {
    user.update({
      disabled: 1
    })
      .then(() => {
        req.logout();
        alertMessage(res, "success", "Account Successfully Deleted", "fas fa-sign-in-alt", true);
        res.redirect("/");
      })
      .catch(err => console.log(err));
  });
});

router.put('/forgotPasswordUpdate/:email', (req, res) => {
  let errors = [];

  let { newPassword, newPassword2 } = req.body;

  if (newPassword !== newPassword2) {
    errors.push({ text: 'New Passwords do not match!' });
  }

  if (newPassword.length < 4) {
    errors.push({ text: 'Password must be at least 4 characters!' });
  }

  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newPassword, salt, function (err, hash) {
      newPassword = hash;
      User.findOne({
        where: {
          email: req.params.email,
        }
      }).then((user) => {
        user.update({
          password: newPassword

        }).then(() => {
          console.log('Redirect');
          alertMessage(res, 'success', 'Password Successfully Changed', 'fas fa-sign-in-alt', true);
          res.redirect("/login");

        }).catch(err => console.log(err))
      })



    });
  });




});

router.put("/changePasswordUpdate/:id", (req, res) => {
  let errors = [];

  let { password, newPassword, newPassword2 } = req.body;

  if (newPassword !== newPassword2) {
    errors.push({ text: "New Passwords do not match!" });
  }

  if (newPassword == password) {
    errors.push({ text: "New password cannot be same as old password!" });
  }

  if (password.length < 4) {
    errors.push({ text: "Password must be at least 4 characters!" });
  }

  bcrypt.compare(password, req.user.password, (err, isMatch) => {
    if (err) {
      errors.push({ text: "Old Password is incorrect!" });
    }
    if (isMatch) {
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newPassword, salt, function (err, hash) {
          newPassword = hash;
          User.findOne({
            where: {
              id: req.params.id
            }
          }).then(user => {
            user
              .update({
                password: newPassword
              })
              .then(() => {
                console.log("Redirect");
                res.redirect("/profileStudent");
              })
              .catch(err => console.log(err));
          });
        });
      });
    }
  });
});

router.put("/profileStudentUpdate/:id", (req, res) => {
  if (req.user.status == "Student") {
    let { email } = req.body;

    if (req.user.email =! email){
      User.findOne({
      where: {
        email: email
      }
    }).then(()=>{ 
      alertMessage(res, "danger", email + " already in use! ","fas fa-sign-in-alt",true);
    res.redirect("/profileStudent");
    });
       
     
    } else {
      User.findOne({
        where: {
          id: req.params.id
        }
      }).then(user => {
        console.log(user);
        user.update({
          username: req.body.username,
          email: req.body.email,
          school: req.body.school,
          faculty: req.body.faculty,
          profilepic: req.body.profilepicURL
        })
          .then(() => {
            console.log("Redirect");
            res.redirect("/profileStudent");
          })
          .catch(err => console.log(err));
      });
    }
  } else if (req.user.status == "Teacher") {
    let { email } = req.body;

    if (req.user.email =! email){
      User.findOne({
        where: {
          email: email
        }
      }).then(()=> {
      alertMessage(res,"danger",email + " already in use! ", "fas fa-sign-in-alt", true);
      res.redirect("/profileStudent");
    });
    } else {
      User.findOne({
        where: {
          id: req.params.id
        }
      }).then(user => {
        console.log(user);
        user.update({
          username: req.body.username,
          fname: req.body.fname,
          lname: req.body.lname,
          awards: req.body.awards,
          email: req.body.email,
          school: req.body.school,
          profilepic: req.body.profilepicURL
        })
          .then(() => {
            console.log("Redirect");
            res.redirect("/profileStudent");
          })
          .catch(err => console.log(err));
      });
    }
  } else if (req.user.status == "Alumni") {
    let { email } = req.body;

    if (req.user.email =! email){
      User.findOne({
        where: {
          email: email
        }
      }).then(()=>{
     
      alertMessage(res, "danger",email + " already in use! ", "fas fa-sign-in-alt", true
      );
      res.redirect("/profileStudent");
      });
    } else {
      User.findOne({
        where: {
          id: req.params.id
        }
      }).then(user => {
        console.log(user);
        user.update({
          username: req.body.username,
          faculty: req.body.faculty,
          email: req.body.email,
          school: req.body.school,
          profilepic: req.body.profilepicURL
        })
          .then(() => {
            console.log("Redirect");
            res.redirect("/profileStudent");
          })
          .catch(err => console.log(err));
      });
    }
  } else {
    let { email } = req.body;

    if (req.user.email =! email){
      User.findOne({
        where: {
          email: email
        }
      }).then(()=>{
      alertMessage(
        res, "danger", email + " already in use! ", "fas fa-sign-in-alt", true
      );
      res.redirect("/profileStudent");
      });
    } else {
      User.findOne({
        where: {
          id: req.params.id
        }
      }).then(user => {
        console.log(user);
        user.update({
          username: req.body.username,
          email: req.body.email,
          school: req.body.school,
          profilepic: req.body.profilepicURL
        })
          .then(() => {
            console.log("Redirect");
            res.redirect("/profileStudent");
          })
          .catch(err => console.log(err));
      });
    }
  }
});

// Upload poster
router.post("/profileStudent/upload", ensureAuthenticated, (req, res) => {
  // Creates user id directory for upload if not exist
  if (!fs.existsSync("./public/uploads/" + req.user.id)) {
    fs.mkdirSync("./public/uploads/" + req.user.id);
  }

  upload(req, res, err => {
    if (err) {
      res.json({ file: "/img/no-image.jpg", err: err });
    } else {
      if (req.file === undefined) {
        res.json({ file: "/img/no-image.jpg", err: err });
      } else {
        res.json({ file: `/uploads/${req.user.id}/${req.file.filename}` });
      }
    }
  });
});

router.get('/listSchoolAdmin', ensureAuthenticated, (req, res) => {

  User.findAll({
    where: {
      status: "Admin",
      overallAdmin: false,
    }
  }).then((admin) => {
    User.findAll({
      where: {
        status: "Teacher"
      }
    }).then((teacher) => {

      res.render('user/listSchoolAdmin', {
        user: req.user,
        admin,
        teacher,
      });
    })
  }).catch(err => console.log(err));
});

// Logout User
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

//Wang Yang
function imgUrlFun(str) {
  var data = "";
  str.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/, function (match, capture) {
    data = capture;
  });
  return data;
}

router.get("/calendar", (req, res) => {
  let user = req.user;
  EventMembers.findAll({
    where: {
      uid: user.id
    }
  }).then(events => {
    res.render("./user/calendar", { events: events });
  });
});

router.get("/chat", (req, res) => {
  res.render("./user/chat"),
    {
      user: req.user
    };
});

router.get("/event", (req, res) => {
  Event.findAll().then(events => {
    console.log(events);
    for (let i in events) {
      events[i].date_str = moment(events[i].date).format("YYYY-MM-DD HH:mm:ss");
      console.log(events[i].date_str);
    }
    res.render("./user/event", { events: events });
  });
});

router.get("/event2", (req, res) => {
  Event.findAll().then(events => {
    console.log(events);
    for (let i in events) {
      events[i].date_str = moment(events[i].date).format("YYYY-MM-DD HH:mm:ss");
      console.log(events[i].date_str);
    }
    res.render("./user/event2", { events: events });
  });
});

router.get("/event_join/:id", (req, res) => {
  console.log(req.user);
  let id = req.params.id;
  let user = req.user;
  Event.findOne({
    where: {
      id: id
    }
  }).then(event => {
    EventMembers.create({
      eventid: id,
      uid: user.id,
      lname: user.lname,
      fname: user.fname,
      username: user.username,
      status: user.status,
      date: event.date,
      title: event.title
    }).then(resp => {
      res.redirect("/event_detail/" + id.toString());
    });
  });
});

router.get("/event_disjoin/:id", (req, res) => {
  let id = req.params.id;
  let user = req.user;
  EventMembers.destroy({
    where: {
      uid: user.id,
      eventid: id
    }
  }).then(resp => {
    res.redirect("/event_detail/" + id.toString());
  });
});

router.get("/event_detail/:id", (req, res) => {
  console.log(req.params.id);
  Event.findOne({
    where: {
      id: req.params.id
    }
  }).then(event => {
    let id = req.params.id;
    EventMembers.findAll({
      where: {
        eventid: req.params.id
      }
    }).then(members => {
      res.render("./user/event_detail", {
        members: members,
        event: event
      });
    });
  });
});


router.post("/newEvent", function (req, res, next) {
  let data = req.body;
  console.log(data);
  if (data && data.title) {
    Event.create({
      ...data
    }).then(resp => {
      console.log(resp);
      let id = resp.dataValues.id;
      res.redirect("/event_detail/" + id.toString());
    });
  } else {
    res.redirect("/event");
  }
});

router.get("/messenger", (req, res) => {
  Messenger.findAll().then(messages => {
    console.log(messages);
    for (let i in messages) {
      if (messages[i].attachments && messages[i].attachments !== "") {
        messages[i].has_attachments = true;
      }
      messages[i].date_str = moment(messages[i].date).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      console.log(messages[i].date_str);
    }
    res.render("./user/messenger", { messages: messages });
  });
});

router.get("/mail_compose", (req, res) => {
  res.render("./user/mail_compose");
});

router.get("/mail_detail", (req, res) => {
  let user = req.user;
  console.log(req.query);
  if (req.query.id) {
    Messenger.findAll({
      where: {
        id: req.query.id
      }
    }).then(message => {
      console.log(message.length);
      if (message.length === 1) {
        let m = message[0];
        if (m.attachments && m.attachments !== "") {
          let l = m.attachments.split(";");
          m.att_num = l.length;
          m.atts = l.map(item => {
            return {
              url: item
            };
          });
          console.log(m.atts);
        }
        Messenger.findAll().then(messages => {
          let a = messages.filter(item => {
            if (item.sendto === user.username) {
              return true;
            }
            return false;
          });
          let b = messages.filter(item => {
            if (item.sender === user.username) {
              return true;
            }
            return false;
          });
          let c = messages.filter(item => {
            if (item.sendto === user.username && item.starred) {
              return true;
            }
            return false;
          });
          res.render("./user/mail_detail", {
            message: m,
            rlen: a.length,
            star: c.length,
            slen: b.length
          });
        });
      } else {
        res.redirect("/messenger");
      }
    });
  } else {
    res.redirect("/messenger");
  }
});
router.get("/news", (req, res) => {
  // 获取所有的news 并显示
  News.findAll().then(news => {
    for (let i in news) {
      let item = news[i];
      if (item.content) {
        item.url = imgUrlFun(item.content);
      }
      if (!item.url) {
        item.url = "/assets/images/big/img1.jpg";
      }
      if (item.update_date) {
        item.update_date_str = moment(item.update_date).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      }
    }
    console.log(news);
    res.render("./user/news", { news: news });
  });
});

router.get("/news_compose", (req, res) => {
  res.render("./user/news_compose");
});

/* 保存news */
router.post("/savenews", (req, res) => {
  let data = req.body;
  console.log(data);
  if (data) {
    News.create({
      ...data,
      update_date: new Date(),
      post_date: new Date()
    }).then(() => {
      res.json({ success: true });
    });
  } else {
    res.json({ success: false });
  }
});

router.get("/news_detail", (req, res) => {
  console.log(req.query);
  if (req.query.id) {
    News.findAll({
      where: {
        id: req.query.id
      }
    }).then(news => {
      if (news.length === 1) {
        res.render("./user/news_detail", { news: news[0] });
      } else {
        res.redirect("/news");
      }
    });
  } else {
    res.redirect("/news");
  }
});

router.post("/newmail", uploads.array("file", 10), function(req, res) {
  console.log(req.files);
  let attachments = "";
  for (var i = 0; i < req.files.length; i++) {
    let newName = req.files[i].destination + req.files[i].originalname;
    let newpath = "/upload/" + req.files[i].originalname;
    fs.rename(req.files[i].path, newName, function(err) {});
    if (attachments === "") {
      attachments = newpath;
    } else {
      attachments = attachments + ";" + newpath;
    }
  }

  let user = req.user;
  console.log(user);
  Messenger.create({
    ...req.body,
    attachments: attachments,
    date: new Date(),
    sender: user.username
  }).then(() => {
    res.redirect("/messenger");
  });
});
//Damien

router.get("/help", (req, res) => {
  res.render("./report/help");
})

router.get("/search", (req, res) => {
  Module.findAll({ order: [['name']], raw: true }).then((modules) => {
    res.render("search/search", { modules: modules,search: " name" })
  }).catch(err => console.log(err));
})

router.get("/reports",/*ensureAuthenticated,*/(req, res) => {
  Report.findAll({ where: { status: "open" }, order: [['id']], raw: true }).then((reports) => {
    res.render("report/listReports", { reports: reports })
  }).catch(err => console.log(err));
})

router.post("/Search", (req, res) => {
  let searchFor = req.body.searchFor;
  let searchUsing = req.body.searchUsing;
  let method = req.body.method;
  if (searchFor == "" || searchUsing == "") {
    error = "Missing selections"
    res.render("search/search", { error })
  }
  else {
    let value = req.body.searchbar_input;
    if (searchFor == "module") {
      if (searchUsing == "ModuleName") {
        Module.findAll({ where: { name: { [op.like]: '%' + value + '%' }} }).then((modules) => {
          res.render("search/search", { modules: modules, names: " modules using module name" })
        })
      }
      else if (searchUsing == "PolytechnicName") {
        Module.findAll({ where: { polytechnic: value }}).then((modules) => {
          res.render("search/search", { modules: modules, names: " modules using polytechnic name" })
        })
      }
      else if (searchUsing == "Category") {
        value = req.body.category;
        Module.findAll({ where: { category: value }}).then((modules) => {
          res.render("search/search", { modules: modules, names: " modules using category" })
        })
      }
      else {
          Module.findAll().then((modules) => {
            res.render("search/search", { modules: modules, names: " modules" })
          })
      }
    }
    else if (searchFor == "teacher") {
      if (searchUsing == "TeacherName") {
        User.findAll({ where: { username: { [op.like]: '%' + value + '%' }} }).then((teachers) => {
          res.render("search/search", { teachers: teachers, names: " teachers using teacher name" })
        })
      }
      else if (searchUsing == "PolytechnicName") {
        User.findAll({ where: { school: value } }).then((teachers) => {
          res.render("search/search", { teachers: teachers, names: " teachers using polytechnic name" })
        })
      }
      else {
        User.findAll({ where: {status: "Teacher"}}).then((teachers) => {
          res.render("search/search", { teachers: teachers, names: " teachers" })
        })
      }
    }
    else if (searchFor == "polytechnic") {
      let value=req.body.searchbar_input;
      if (searchUsing == "PolytechnicName") {
        SchoolInfo.findAll({ where: { schoolname: value }}).then((schools) => {
        polytechnics=[];
        schools.forEach((school)=>{
        total=0;
        count=0;
        Review.findAll({where:{reviewschoolname:school.get({plain:true}).schoolname}}).then((review)=>{
        review.forEach((dog)=>{
            total+=parseInt(dog.get({plain:true}).rating);
            count+=1
        })
        avg=0
        if (total!=0){
        avg=total/count;
        }
        polytechnics.push({UserRating:avg,schoolname:school.get({plain:true}).schoolname,address:school.get({plain:true}).address})
        })
        res.render("search/search", { polytechnics: polytechnics, names: " Polytechnic using polytechnic name" })
        })
        })
      }
      else if (searchUsing == "AddressName") {
        SchoolInfo.findAll({ where: { address: { [op.like]: '%' + value + '%' }} }).then((schools) => {
        polytechnics=[];
        schools.forEach((school)=>{
        total=0;
        count=0;
        Review.findAll({where:{reviewschoolname:school.get({plain:true}).schoolname}}).then((review)=>{
        review.forEach((dog)=>{
            total+=parseInt(dog.get({plain:true}).rating);
            count+=1
        })
        avg=0
        if (total!=0){
        avg=total/count;
        }
        polytechnics.push({UserRating:avg,schoolname:school.get({plain:true}).schoolname,address:school.get({plain:true}).address})
        })
        res.render("search/search", { polytechnics: polytechnics, names: " Polytechnic using polytechnic name" })
        })
        })
      }
      else if (searchUsing == "UserRating") {
        let value = parseInt(req.body.myRange);
        SchoolInfo.findAll().then((schools)=>{
        polytechnics=[]
        schools.forEach((school)=>{
        total=0;
        count=0;
        Review.findAll({where:{reviewschoolname:school.get({plain:true}).schoolname}}).then((review)=>{
        review.forEach((dog)=>{
                total+=parseInt(dog.get({plain:true}).rating);
                count+=1
        })
                console.log(total);
                if (total!=0){
                avg=total/count;
                }
                else{
                avg=0;
                }
                if(method=="Maximum"){
                if(avg<=value){
                        polytechnics.push({UserRating:avg,schoolname:school.get({plain:true}).schoolname,address:school.get({plain:true}).address});
                }
                }
                else if (method=="Minimum"){
                if(avg>=value){
                        polytechnics.push({UserRating:avg,schoolname:school.get({plain:true}).schoolname,address:school.get({plain:true}).address});
                }
                }
        })
        })
                if (method == "Maximum") {
                  polytechnics.sort(function(first,second){
                  return second.UserRating-first.UserRating
                  });
                    res.render("search/search", { polytechnics: polytechnics,names: " Polytechnics using maximum user score under " + value })
                }
                else if (method == "Minimum") {
                    polytechnics.sort(function(first,second){
                     return second.UserRating-first.UserRating
                     });
                    res.render("search/search", { polytechnics: polytechnics,names: " Polytechnics using minimum user score over " + value })
                }
        })
      }
      else {
        SchoolInfo.findAll().then((schools) => {
          res.render("search/search", { polytechnics: schools, names: " Polytechnic" })
        })
      }
    }
  }
})

module.exports = router;
