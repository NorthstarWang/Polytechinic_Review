const express = require('express');
const router = express.Router();
const User = require("../models/User");
const Review = require('../models/Review');
const Profanities = require('../models/Profanities');
const SchoolInfo = require('../models/SchoolInfo');
const Module = require('../models/Module');
const Faculty = require('../models/Faculty');

const alertMessage = require('../helpers/messenger');
var bcrypt = require('bcryptjs');
const passport = require('passport');
const fs = require('fs');
const upload = require('../helpers/imageUpload_dom');
const ensureAuthenticated = require('../helpers/auth');
const moment = require('moment')
// SendGrid
const sgMail = require('@sendgrid/mail');
// JWT
const jwt = require('jsonwebtoken');


router.get('/directory', (req, res) => {
	SchoolInfo.findAll({
	}).then((schoolinfo) => {
		res.render('./directory/listDirectory', {
			schoolinfo: schoolinfo,
			users: req.user
		});
	})
});

router.get('/directory2', (req, res) => {
	SchoolInfo.findAll({
	}).then((schoolinfo) => {
		res.render('./directory/listDirectory2', {
			schoolinfo: schoolinfo,
			users: req.user
		});
	})
});

router.post('/school', (req, res) => {
	let school = req.body.school;
	req.session.message = school; // store school name into req.session.message cuz i dont know how to properly do it
	res.redirect('/directory/school'); // fix if can thx 24/7/2019 dom
});

router.post('/upload', (req, res) => {
	// Creates user id directory for upload if not exist
	let userId = req.user.id;
	if (!fs.existsSync('./public/schuploads')) {
		fs.mkdirSync('./public/schuploads');
	}
	
	upload(req, res, (err) => {
		if (err) {
			res.json({ file: '/img/no-image.jpg', err: err });
		} else {
			if (req.file === undefined) {
				res.json({ file: '/img/no-image.jpg', err: err });
			} else {
				res.json({ file: `/schuploads/${req.file.filename}` });
			}
		}
	});
});

router.get('/school:', (req, res) => {
	if (req.session.message != null || undefined) { // check if sch is set
		var schoolName = req.session.message;
		console.log("SchoolName successfully set as " + req.session.message);
	}
	else {
		var schoolName = "NYP";
		console.log("Error, Schoolname set to default school(NYP) ");
	}
	console.log('stored schoolname is: ' + schoolName);
	var schoolObject;
	SchoolInfo.findOne({
		where: {
			schoolname: schoolName
		}
	}).then((SchoolInfo) => {
		schoolObject = SchoolInfo;
		console.log("school output: " + SchoolInfo.schoolname)
	});
	Review.findAll({
		where: {
			reviewschoolname: schoolName
		}
		/*where: {
			userId: req.user.id
		},
		order: [
			['title', 'ASC']
		],
		raw: true*/
	})
		.then((reviews) => {
			let reviewNum = 0;
			let reviewCount = 0;
			let reviewPercentage = 0;
			reviews.forEach(element => {
				reviewNum += parseFloat(element.rating);
				if (element.rating == 1) {
					reviewPercentage++;
				}
				reviewCount++;
			});
			if (reviewCount != 0) {
				reviewNum /= reviewCount;
				reviewNum = reviewNum.toFixed(2);
				reviewPercentage = Math.round((reviewPercentage / reviewCount) * 100).toFixed(2);
			}
			else {
				reviewNum = 0;
				reviewPercentage = 0;
			}

			res.render('./directory/school', {
				reviews: reviews,
				reviewNum: reviewNum,
				reviewCount: reviewCount,
				reviewPercentage: reviewPercentage,
				schoolObject
			});
		})
		.catch(err => console.log(err));
});



router.get('/schoolinfoEdit',  ensureAuthenticated, (req, res) => {
	var schoolName = req.session.message;
	SchoolInfo.findOne({
		where: {
			schoolname: schoolName
		}
	}).then((SchoolInfo) => {
		res.render('./directory/schoolinfoEdit', {
			SchoolInfo
		});
	}).catch(err => console.log(err));
});

router.get('/schoolinfoEdit/:schoolname',  ensureAuthenticated, (req, res) => {
	var schoolName = req.params.schoolname;
	SchoolInfo.findOne({
		where: {
			schoolname: schoolName
		}
	}).then((SchoolInfo) => {
		res.render('./directory/schoolinfoEdit', {
			SchoolInfo
		});
	}).catch(err => console.log(err));
});

router.get('/school/:schoolname', (req, res) => {
	console.log('stored schoolname is: ' + req.params.schoolname);
	var schoolObject;
	var UserObject;
	SchoolInfo.findOne({
		where: {
			schoolname: req.params.schoolname
		}
	}).then((SchoolInfo) => {
		schoolObject = SchoolInfo;
		//console.log("school output: " + SchoolInfo.schoolname)
	});
	User.findAll({
	}).then((User) => {
		UserObject = User;
		//console.log("User output: " + UserObject.username)
	});
	Review.findAll({
		where: {
			reviewschoolname: req.params.schoolname
		}
		/*where: {
			userId: req.user.id
		},
		order: [
			['title', 'ASC']
		],
		raw: true*/
	})
		.then((reviews) => {
			let reviewNum = 0;
			let reviewCount = 0;
			let reviewPercentage = 0;
			reviews.forEach(element => {
				reviewNum += parseFloat(element.rating);
				if (element.rating == 1) {
					reviewPercentage++;
				}
				reviewCount++;
			});
			if (reviewCount != 0) {
				reviewNum /= reviewCount;
				reviewNum = reviewNum.toFixed(2);
				reviewPercentage = Math.round((reviewPercentage / reviewCount) * 100).toFixed(2);
			}
			else {
				reviewNum = 0;
				reviewPercentage = 0;
			}

			res.render('./directory/school', {
				reviews: reviews,
				reviewNum: reviewNum,
				reviewCount: reviewCount,
				reviewPercentage: reviewPercentage,
				schoolObject,
				UserObject
			});
		})
		.catch(err => console.log(err));
});

router.get('/recoverSchool',  ensureAuthenticated, (req, res) => {
	let comparison = "";
	let schoolnames = new Array();
	let schoolnames2 = new Array();
	SchoolInfo.findAll({
		where: {
			isDeleted: comparison
		}
	}).then((SchoolInfo) => {
		SchoolInfo.forEach(element => {
			schoolnames.push(element.schoolname);
			schoolnames2.push(element.schoolname2);
		});
		res.render('./directory/recoverSchool', {
			SchoolInfo: SchoolInfo,
			schoolnames: schoolnames,
			schoolnames2: schoolnames2
		});
	})
});


router.put('/recoverSchool', (req, res) => { // legacy form
	let schoolname2 = req.body.RecoverSchoolInput;
	console.log(schoolname2);
	let setFalse = "False";
	SchoolInfo.update({
		isdeleted: setFalse
	}, {
			where: {
				schoolname2: schoolname2
			}
		}).then(() => {
			setTimeout(function () {
				res.redirect('/directory/directory');
			}, 2500);
		}).catch(err => console.log(err));
});

router.put('/recoverSchool/:schoolname', (req, res) => {
	let schoolname = req.params.schoolname;
	console.log(schoolname);
	let setFalse = "False";
	SchoolInfo.update({
		isdeleted: setFalse
	}, {
			where: {
				schoolname: schoolname
			}
		}).then(() => {
			setTimeout(function () {
				res.redirect('/directory/directory');
			}, 2500);
		}).catch(err => console.log(err));
});

router.get('/moduleAdd',  ensureAuthenticated, (req, res) => {
	res.render('./directory/moduleAdd')
});

router.post('/moduleAdd', (req, res) => {
	let modulename = req.body.modulename;
	let ModuleCategory = req.body.ModuleCategory;
	let Schoolname = req.body.Schoolname;
	let SchoolID = req.body.SchoolID;
	let UserRating = -1;
	Module.create({
		name: modulename,
		category: ModuleCategory,
		polytechnic: Schoolname,
		polytechnicID: SchoolID,
		userRating: UserRating
	}).then(() => {
		setTimeout(function () {
			res.redirect('/search');
		}, 2500);
	}).catch(err => console.log(err));
});

router.get('/module/:id', (req, res) => {
	Module.findOne({
		where: { id: req.params.id }
	}).then((module) => {
		res.render('./directory/module', { module: module })
	})
})

router.get('/moduleEdit/:id',  ensureAuthenticated, (req, res) => {
	Module.findOne({
		where: {
			id: req.params.id // change this to a params after compile with damien
		}
	}).then((Modules) => {
		res.render('./directory/moduleEdit', {
			Modules  // passes Profanities object to handlebar
		});
	}).catch(err => console.log(err));
});

router.put('/moduleEdit/:id', (req, res) => {
	let modulename = req.body.modulename;
	let ModuleCategory = req.body.ModuleCategory;
	let Schoolname = req.body.Schoolname;
	let SchoolID = req.body.SchoolID;
	Module.update({
		name: modulename,
		category: ModuleCategory,
		polytechnic: Schoolname,
		polytechnicID: SchoolID
	}, {
			where: {
				id: req.params.id
			}
		}).then(() => {
			setTimeout(function () {
				res.redirect('/directory/directory');
			}, 2500);
		}).catch(err => console.log(err));
});

router.get('/moduleDelete/:id', (req, res) => {
	// change this with params too!
	Module.findOne({
		where: {
			id: req.params.id,
		},
	}).then((Module) => {
		Module.destroy({
			where: {
				id: Module.id
			}
		})
		setTimeout(function () {
			res.redirect('/search');
		}, 2500);
	}).catch(err => console.log(err));
});

router.get('/schoolinfoAdd', (req, res) => {
	res.render('./directory/schoolinfoAdd')
});

router.post('/schoolinfoAdd', (req, res) => {
	let schoolName = req.body.schoolname.toString();
	let schoolname2 = req.body.schoolname2;
	let website = req.body.website;
	let basicinfo = req.body.basicinfo;
	let faculty = req.body.faculty;
	let email = req.body.email;
	let phone = req.body.phone.toString();
	let address = req.body.address;
	let imgurl = req.body.imgurl;
	let isDeleted = "False";
	SchoolInfo.create({
		schoolname: schoolName,
		schoolname2: schoolname2,
		website: website,
		basicinfo: basicinfo,
		faculty: faculty,
		email: email,
		phone: phone,
		address: address,
		imgurl: imgurl,
		isdeleted: isDeleted
	}).then(() => {
		setTimeout(function () {
			res.redirect('/directory/directory');
		}, 2500);
	}).catch(err => console.log(err));
});

router.put('/schoolinfoEdit/:schoolname', (req, res) => {
	let schoolName = req.params.schoolname; // change this later thx future dom :) 24/7/2019 auto gen anchor tags ltr set reminder
	let schoolname2 = req.body.schoolname2;
	let website = req.body.website;
	let basicinfo = req.body.basicinfo;
	let faculty = req.body.faculty;
	let email = req.body.email;
	let phone = req.body.phone.toString();
	let address = req.body.address;
	let imgurl = req.body.imgurl;
	SchoolInfo.update({
		schoolname2: schoolname2,
		website: website,
		basicinfo: basicinfo,
		faculty: faculty,
		email: email,
		phone: phone,
		address: address,
		imgurl: imgurl
	}, {
			where: {
				schoolname: schoolName
			}
		}).then(() => {
			setTimeout(function () {
				res.redirect('/directory/directory');
			}, 2500);
		}).catch(err => console.log(err));
});

router.put('/schoolinfoDelete/:schoolname', (req, res) => {
	let schoolName = req.params.schoolname; // change this later thx future dom :) 24/7/2019 auto gen anchor tags ltr set reminder
	let isDeleted = "";
	SchoolInfo.update({
		isdeleted: isDeleted
	}, {
			where: {
				schoolname: schoolName
			}
		}).then(() => {
			setTimeout(function () {
				res.redirect('/directory/directory');
			}, 5000);
		}).catch(err => console.log(err));
});

router.get('/profanitiesEdit', (req, res) => {
	Profanities.findOne({
		where: {
			id: 1
		}
	}).then((Profanities) => {
		res.render('./directory/profanitiesEdit', {
			Profanities  // passes Profanities object to handlebar
		});
	}).catch(err => console.log(err));
});

router.put('/profanitiesEdit', (req, res) => {
	let profanities = req.body.Profanities;
	Profanities.update({
		profanities: profanities
	}, {
			where: {
				id: 1
			}
		}).then(() => {
			res.redirect('/directory/directory');
		}).catch(err => console.log(err));
});

router.post('/reviewSchool/:schoolname', (req, res) => {
	let rating = req.body.rating.toString();
	let title = req.body.title;
	let facilitydesc = req.body.facilitydesc;
	let facultydesc = req.body.facultydesc;
	let recommend = req.body.recommend === undefined ? '' : req.body.recommend.toString();
	let feedbackdesc = req.body.feedbackdesc;
	let reviewschoolname = req.params.schoolname;
	let userId = req.user.id;
	// Multi-value components return array of strings or undefined
	Review.create({
		rating,
		title,
		facilitydesc,
		facultydesc,
		recommend,
		feedbackdesc,
		reviewschoolname,
		userId
	}).then((review) => {
		setTimeout(function () {
			res.redirect('/directory/school/' + req.params.schoolname);
		}, 2500);
	})
		.catch(err => console.log(err))
});

router.get('/edit/:id', (req, res) => {
	if (req.session.message != null || undefined) { // check if sch is set
		var schoolName = req.session.message;
		console.log("SchoolName successfully set as " + req.session.message);
	}
	else {
		var schoolName = "NYP";
		console.log("Error, Schoolname set to default school(NYP) ");
	}
	console.log('stored schoolname is: ' + schoolName);
	var schoolObject;
	SchoolInfo.findOne({
		where: {
			schoolname: schoolName
		}
	}).then((SchoolInfo) => {
		schoolObject = SchoolInfo;
		console.log("school output: " + SchoolInfo.schoolname)
	});
	var profanitiyObject;
	Profanities.findOne({
		where: {
			id: 1
		}
	}).then((Profanities) => {
		profanitiyObject = Profanities;
		console.log(profanitiyObject.profanities);
	})
	Review.findOne({
		where: {
			id: req.params.id
		}
	}).then((review) => {
		// call views/video/editVideo.handlebar to render the edit video page
		res.render('./directory/editReview', {
			review,
			Profanities: profanitiyObject,
			schoolObject // passes video object to handlebar
		});
	}).catch(err => console.log(err)); // To catch no video ID
});

router.get('/reviewSchool', (req, res) => {
	if (req.session.message != null || undefined) { // check if sch is set
		var schoolName = req.session.message;
		console.log("SchoolName successfully set as " + req.session.message);
	}
	else {
		var schoolName = "NYP";
		console.log("Error, Schoolname set to default school(NYP) ");
	}
	console.log('stored schoolname is: ' + schoolName);
	var schoolObject;
	SchoolInfo.findOne({
		where: {
			schoolname: schoolName
		}
	}).then((SchoolInfo) => {
		schoolObject = SchoolInfo;
		console.log("school output: " + SchoolInfo.schoolname)
	});
	Profanities.findOne({
		where: {
			id: 1
		}
	}).then((Profanities) => {
		res.render('./directory/reviewSchool', {
			Profanities,
			schoolObject  // passes Profanities object to handlebar
		});
	}).catch(err => console.log(err));
});

router.get('/reviewSchool/:schoolname', (req, res) => {
	var schoolName = req.params.schoolname;
	var schoolObject;
	SchoolInfo.findOne({
		where: {
			schoolname: schoolName
		}
	}).then((SchoolInfo) => {
		schoolObject = SchoolInfo;
		console.log("school output: " + SchoolInfo.schoolname)
	});
	Profanities.findOne({
		where: {
			id: 1
		}
	}).then((Profanities) => {
		res.render('./directory/reviewSchool', {
			Profanities,
			schoolObject  // passes Profanities object to handlebar
		});
	}).catch(err => console.log(err));
});

router.put('/saveReviewEdit/:id/:reviewschoolname', (req, res) => {
	let rating = req.body.rating.toString();
	let title = req.body.title;
	let facilitydesc = req.body.facilitydesc;
	let facultydesc = req.body.facultydesc;
	let recommend = req.body.recommend === undefined ? '' : req.body.recommend.toString();
	let feedbackdesc = req.body.feedbackdesc;
	let reviewschoolname = req.params.reviewschoolname;
	Review.update({
		rating: rating,
		title: title,
		facilitydesc: facilitydesc,
		facultydesc: facultydesc,
		recommend: recommend,
		feedbackdesc: feedbackdesc
	}, {
			where: {
				id: req.params.id
			}
		}).then(() => {
			setTimeout(function () {
				res.redirect('/directory/school/' + reviewschoolname);
			}, 2500);
		}).catch(err => console.log(err));
});


router.get('/deletereview/:id/:schoolname', (req, res) => {
	let reviewID = req.params.id;
	let schoolname = req.params.schoolname;
	Review.findOne({
		where: {
			id: reviewID,
		},
	}).then((review) => {
		Review.destroy({
			where: {
				id: reviewID
			}
		})
		setTimeout(function () {
			res.redirect('/directory/school/' + schoolname);
		}, 3500);

	}).catch(err => console.log(err));
});

router.get('/faculty/:name', (req, res) => {
	Faculty.findOne({ where: { name: req.params.name } }).then(faculty => {
		res.render('polytechnic/faculty', { faculty: faculty })
	})
})















module.exports = router;