const express = require('express');
const router = express.Router();
const User = require('../models/User');
const News = require('../models/News');
const Event = require('../models/Event');

const Messenger = require('../models/Messenger');
const alertMessage = require('../helpers/messenger');
var bcrypt = require('bcryptjs');
const passport = require('passport');
const fs = require('fs');
const upload = require('../helpers/imageUpload');
const ensureAuthenticated = require('../helpers/auth');
const moment = require('moment')
// SendGrid
const sgMail = require('@sendgrid/mail');
// JWT
const jwt = require('jsonwebtoken');
require('env2')('.env');



router.get('/verify/:userId/:token', (req, res, next) => {
	// retreiever from user check, then set verified to true
	User.findOne({
		where: { id: req.params.userId }
	}).then(user => {
		if (user) {
			let userEmail = user.email;
			if (user.verified === true){
				alertMessage(res, 'info', 'User already verified', 'fas fa-exclamation-circle', true);
				res.redirect('/login');
			}else {
				jwt.verify(req.params.token, 's3cr3Tk3y', (err, authData) => {
					if(err) {
						alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
						res.redirect('/');
					} else {
						User.update({
								verified: 1
							}, {
								where: { id: user.id }
							}
						).then(user => {
							alertMessage(res, 'success', userEmail + ' verified. Please login', 'fas fa-sign-in-alt', true);
							res.redirect('/login');
						});
					}
				});
			}
		}else {
			alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
			res.redirect('/');
		}
	});
	
});


function sendEmail(userId, email, token){
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	
	const message = {
		to: email,
		from: 'Do Not Reply <admin@school-gate.sg>',
		subject: 'Verify School Gate Account',
		text: 'and easy to do anywhere, even with Node.js',
		html: `Thank you registering with School Gate.<br><br>
Please <a href="http://${process.env.SERVER}/user/verify/${userId}/${token}"><strong>verify</strong></a>
your account.`
	};
	return new Promise((resolve, reject) => {
		sgMail.send(message)
			.then(msg => resolve(msg))
			.catch(err => reject(err));
	});
}

router.get('/changepassword/:email', (req, res, next) => {
    // retreiever from user check, then set verified to true
    
	User.findOne({
		where: { email: req.params.email }
	}).then(user => {
		res.render('user/forgotPassword', {
            email: req.params.email,
        });
	});
	
});



function sendEmailChgPass(email){
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	
	const messageChgPass = {
		to: email,
		from: 'Do Not Reply <admin@school-gate.sg>',
		subject: 'Change New Password',
		text: 'and easy to do anywhere, even with Node.js',
		html: `Forgot Password.<br><br>
Please <a href="http://${process.env.SERVER}/user/changepassword/${email}"><strong>click this link</strong></a>
to change password for your account.`
	};
	return new Promise((resolve, reject) => {
		sgMail.send(messageChgPass)
			.then(msg => resolve(msg))
			.catch(err => reject(err));
	});
}




// Login Form POST => /user/login
router.post('/login', (req, res, next) => {
    User.findOne({
        where: {email: req.body.email}
    }).then(user =>{
        if (user) {
            if(user.verified != true){
                alertMessage(res, 'danger', 'Email ' + user.email + ' has not been verified.', 'fas fa-exclamation-circle', true);
				res.redirect('/');
            } else if(user.disabled == true) {
                alertMessage(res, 'danger', 'User ' + user.email + ' not found.', 'fas fa-exclamation-circle', true);
				res.redirect('/');
            } else {
                passport.authenticate('local', {
                    successRedirect: '/home',
                    failureRedirect: '/login', // Route to /login URL
                    failureFlash: true
                    /* Setting the failureFlash option to true instructs Passport to flash an error
                    message using the message given by the strategy's verify callback, if any.
                    When a failure occur passport passes the message object as error */
                })(req, res, next);
            }
        }
    });
   
});

router.post('/forgotPassword', (req, res) => {
    
    let errors = [];

    let success_msg = ""

    let email = req.body.email;

    sendEmailChgPass(email)
    .then((msg) => {
        alertMessage(res, 'success', + '. Please logon to ' + email + ' to change password.'
            , 'fas fa-sign-in-alt', true);
        res.redirect('/login');
    })

});

// User register URL using HTTP post => /user/register
router.post('/registerStudent', (req, res) => {
    let errors = [];

    let success_msg = ""
    // Retrieves fields from register page from request body

    let { status, school, faculty, exptgraddate, username, email, password, password2 } = req.body;

    let profilepic = "/img/defaultpic.png"


    // Checks if both passwords entered are the same
    if (password !== password2) {
        errors.push({ text: 'Passwords do not match' });
    }

    // Checks that password length is more than 4
    if (password.length < 4) {
        errors.push({ text: 'Password must be at least 4 characters' });
    }
    if (errors.length > 0) {
        res.render('user/registerStudent', {
            errors,
            school,
            faculty,
            exptgraddate,
            username,
            email,
            password,
            password2,
            profilepic,

        });
    } else {
        // If all is well, checks if user is already registered
        User.findOne({ where: { email: req.body.email } })
            .then(user => {
                if (user) {
                    // If user is found, that means email has already been
                    // registered
                    res.render('user/registerStudent', {
                        error: user.email + ' already registered',
                        school,
                        faculty,
                        exptgraddate,
                        username,
                        email,
                        password,
                        password2,
                        profilepic
                    });
                } else {
                    // Generate JWT token
                    let token;
                    jwt.sign(email, 's3cr3Tk3y', (err, jwtoken) => {
                        if (err) console.log('Error generating Token: ' + err);
                        token = jwtoken;
                    });
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(password, salt, function (err, hash) {
                            password = hash;
                            // Create new user record
                            User.create({ username, school, faculty, exptgraddate, status, email, password, profilepic, overallAdmin: 0, verified: 0, disabled: 0, })
                                .then(user => {
                                    sendEmail(user.id, user.email, token)
                                    .then((msg) => {
                                        alertMessage(res, 'success', user.username + ' added. Please logon to ' + user.email + ' to verify account.'
										    , 'fas fa-sign-in-alt', true);
                                        res.redirect('/login');
                                })
                                .catch((err) => {
                                    alertMessage(res, 'warning', 'Error sending to ' + user.email, 'fas fa-sign-in-alt', true);
									res.redirect('/');
                                }); 
                        }).catch(err => console.log(err));
                    
                     })
                });
            }
        });

    }
});

router.post('/registerTeacher', (req, res) => {
    let errors = [];

    let success_msg = ""
    // Retrieves fields from register page from request body

    let { status, school, email, username, fname, lname, password, password2 } = req.body;

    let profilepic = "/img/defaultpic.png"


    // Checks if both passwords entered are the same
    if (password !== password2) {
        errors.push({ text: 'Passwords do not match' });
    }

    // Checks that password length is more than 4
    if (password.length < 4) {
        errors.push({ text: 'Password must be at least 4 characters' });
    }
    if (errors.length > 0) {
        res.render('user/registerTeacher', {
            errors,
            school,
            email,
            username,
            fname,
            lname,
            password,
            password2,
            profilepic

        });
    } else {
        // If all is well, checks if user is already registered
        User.findOne({ where: { email: req.body.email } })
            .then(user => {
                if (user) {
                    // If user is found, that means email has already been
                    // registered
                    res.render('user/registerTeacher', {
                        error: user.email + ' already registered',
                        school,
                        email,
                        username,
                        fname,
                        lname,
                        password,
                        password2,
                        profilepic
                    });
                } else {
                    // Generate JWT token
                    let token;
                    jwt.sign(email, 's3cr3Tk3y', (err, jwtoken) => {
                        if (err) console.log('Error generating Token: ' + err);
                        token = jwtoken;
                    });
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(password, salt, function (err, hash) {
                            password = hash;

                            // Create new user record
                            User.create({ username, school, email, status, fname, lname, password, profilepic, overallAdmin: 0, verified: 0, disabled: 0, })
                                .then(user => {
                                    sendEmail(user.id, user.email, token)
                                    .then((msg) => {
                                        alertMessage(res, 'success', user.username + ' added. Please logon to ' + user.email + ' to verify account.'
										    , 'fas fa-sign-in-alt', true);
                                        res.redirect('/login');
                                })
                                .catch((err) => {
                                    alertMessage(res, 'warning', 'Error sending to ' + user.email, 'fas fa-sign-in-alt', true);
									res.redirect('/');
                                }); 

                        }).catch(err => console.log(err));
                      
                      })

                  });
             }
        });

    }
});

router.post('/registerAlumni', (req, res) => {
    let errors = [];

    let success_msg = ""
    // Retrieves fields from register page from request body

    let { status, school, faculty, email, username, password, password2 } = req.body;

    let profilepic = "/img/defaultpic.png"



    // Checks if both passwords entered are the same
    if (password !== password2) {
        errors.push({ text: 'Passwords do not match' });
    }

    // Checks that password length is more than 4
    if (password.length < 4) {
        errors.push({ text: 'Password must be at least 4 characters' });
    }
    if (errors.length > 0) {
        res.render('user/registerTeacher', {
            errors,
            school,
            faculty,
            email,
            username,
            password,
            password2,
            profilepic

        });
    } else {
        // If all is well, checks if user is already registered
        User.findOne({ where: { email: req.body.email } })
            .then(user => {
                if (user) {
                    // If user is found, that means email has already been
                    // registered
                    res.render('user/registerTeacher', {
                        error: user.email + ' already registered',
                        school,
                        faculty,
                        email,
                        username,
                        password,
                        password2,
                        profilepic
                    });
                } else {
                    // Generate JWT token
                    let token;
                    jwt.sign(email, 's3cr3Tk3y', (err, jwtoken) => {
                        if (err) console.log('Error generating Token: ' + err);
                        token = jwtoken;
                    });
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(password, salt, function (err, hash) {
                            password = hash;
                            // Create new user record
                            User.create({ username, school, email, status, faculty, password, profilepic, overallAdmin: 0, verified: 0, disabled:0, })
                                .then(user => {
                                    sendEmail(user.id, user.email, token)
                                    .then((msg) => {
                                        alertMessage(res, 'success', user.username + ' added. Please logon to ' + user.email + ' to verify account.'
										    , 'fas fa-sign-in-alt', true);
                                        res.redirect('/login');
                                })
                                .catch((err) => {
                                    alertMessage(res, 'warning', 'Error sending to ' + user.email, 'fas fa-sign-in-alt', true);
									res.redirect('/');
                                }); 

                        }).catch(err => console.log(err));
                    })

                });
            }
        });

    }
});



router.get('/promote/:id', (req, res) => {
	User.findOne({
		where: {
			id: req.params.id
		},
	}).then((user) => {
        
			user.update({	
                
                status: "Admin",
                
			}).then(() => {
				res.redirect('/listSchoolAdmin'); 
			}).catch(err => console.log(err));
		
	});
});

router.get('/remove/:id', (req, res) => {
	User.findOne({
		where: {
			id: req.params.id
		},
	}).then((user) => {
        
			user.update({	
                
                status: "Teacher",
                
			}).then(() => {
				res.redirect('/listSchoolAdmin'); 
			}).catch(err => console.log(err));
		
	});
});



module.exports = router;