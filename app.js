/*
* 'require' is similar to import used in Java and Python. It brings in the libraries required to be used
* in this JS file.
* */
const express = require('express');
const session = require('express-session');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ueditor = require('ueditor');
require('env2')('.env');

// Library to use MySQL to store session objects
const MySQLStore = require('express-mysql-session');
const db = require('./config/db'); // db.js config file
const flash = require('connect-flash');
const FlashMessenger = require('flash-messenger'); 
const passport = require('passport');


/*
* Loads routes file main.js in routes directory. The main.js determines which function
* will be called based on the HTTP request and URL.
*/
const mainRoute = require('./routes/main');
const userRoute = require('./routes/user');
const directoryRoute = require('./routes/directory');
const reportRoute=require('./routes/report');
const {formatDate} = require('./helpers/hbs');

//const {formatDate} = require('./helpers/hbs');

// Bring in database connection
const vidjotDB = require('./config/DBConnection');
// Connects to MySQL database
vidjotDB.setUpDB(false); // To set up database with new tables set (true)

const authenticate = require('./config/passport');
authenticate.localStrategy(passport);

/*
* Creates an Express server - Express is a web application framework for creating web applications
* in Node JS.
*/
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// Handlebars Middleware
/*
* 1. Handlebars is a front-end web templating engine that helps to create dynamic web pages using variables
* from Node JS.
*
* 2. Node JS will look at Handlebars files under the views directory
*
* 3. 'defaultLayout' specifies the main.handlebars file under views/layouts as the main template
*
* */
app.engine('handlebars', exphbs({
	helpers:{
		formatDate: formatDate,
		eq: function (v1, v2) {
            return v1 === v2;
        },
        ne: function (v1, v2) {
            return v1 !== v2;
        },
        lt: function (v1, v2) {
            return v1 < v2;
        },
        gt: function (v1, v2) {
            return v1 > v2;
        },
        lte: function (v1, v2) {
            return v1 <= v2;
        },
        gte: function (v1, v2) {
            return v1 >= v2;
        },
        and: function () {
            return Array.prototype.slice.call(arguments).every(Boolean);
        },
        or: function () {
            return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
        },
		compare: function (lvalue, operator, rvalue, options){

			var operators, result;
			
			if (arguments.length < 3) {
				throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
			}
			
			if (options === undefined) {
				options = rvalue;
				rvalue = operator;
				operator = "===";
			}
			
			operators = {
				'==': function (l, r) { return l == r; },
				'===': function (l, r) { return l === r; },
				'!=': function (l, r) { return l != r; },
				'!==': function (l, r) { return l !== r; },
				'<': function (l, r) { return l < r; },
				'>': function (l, r) { return l > r; },
				'<=': function (l, r) { return l <= r; },
				'>=': function (l, r) { return l >= r; },
				'typeof': function (l, r) { return typeof l == r; }
			};
			
			if (!operators[operator]) {
				throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
			}
			
			result = operators[operator](lvalue, rvalue);
			
			if (result) {
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		
		}
	},
	defaultLayout: 'main' // Specify default template views/layout/main.handlebar 
}));
app.set('view engine', 'handlebars');


// Body parser middleware to parse HTTP body in order to read HTTP data
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, '/public')));

// Method override middleware to use other HTTP methods such as PUT and DELETE
app.use(methodOverride('_method'));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());



// To store session information. By default it is stored as a cookie on browser
app.use(session({
	key: 'vidjot_session',
	secret: 'tojiv',
	store: new MySQLStore({
		host: db.host,
		port: 3306,
		user: db.username,
		password: db.password,
		database: db.database,
		clearExpired: true,
		// How frequently expired sessions will be cleared; milliseconds:
		checkExpirationInterval: 900000,
		// The maximum age of a valid session; milliseconds:
		expiration: 900000,
		}),
	resave: false,
	saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
   });
   
app.use(FlashMessenger.middleware);

// Place to define global variables - not used in practical 1
app.use(function (req, res, next) {
	next();
});


// Use Routes
/*
* Defines that any root URL with '/' that Node JS receives request from, for eg. http://localhost:5000/, will be handled by
* mainRoute which was defined earlier to point to routes/main.js
* */
app.use('/', mainRoute); // mainRoute is declared to point to routes/main.js
// This route maps the root URL to any path defined in main.js
app.use('/user', userRoute);
app.use('/directory', directoryRoute);
app.use('/report',reportRoute);

app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(bodyParser.json());

app.use("/ueditor/ueditor/ue", ueditor(path.join(__dirname, '/public'), function(req, res, next) {
	/* 客户端上传文件设置 */
	var imgDir = './images_save/'
	var ActionType = req.query.action;
	if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
		var file_url = imgDir; /* 默认图片上传地址 */
		/* 其他上传格式的地址 */
		if (ActionType === 'uploadfile') {
			file_url = './file_save/';  /* 附件 */
		}
		if (ActionType === 'uploadvideo') {
			file_url = './video_save/'; /* 视频 */
		}
		console.log(ActionType, file_url);
		res.ue_up(file_url); /* 你只要输入要保存的地址 。保存操作交给ueditor来做 */
		res.setHeader('Content-Type', 'text/html');
	}
	/*  客户端发起图片列表请求 */
	else if (req.query.action === 'listimage') {
		var dir_url = imgDir;
		res.ue_list(dir_url);  /* 客户端会列出 dir_url 目录下的所有图片 */
	}
	/*  客户端发起其它请求 */
	else {
		res.setHeader('Content-Type', 'application/json');
		res.redirect('/ueditor/config.json')
	}})
);
/*
* Creates a unknown port 5000 for express server since we don't want our app to clash with well known
* ports such as 80 or 8080.
* */
const port = 5000;

// Starts the server and listen to port 5000
server.listen(port, function(){
	console.log('listening on port ' + port);
	
	
	var usernames = {};

// rooms which are currently available in chat
var rooms = ['Discussion room','SP','NP','NYP','TP','RP','Helpdesk'];

io.sockets.on('connection', function (socket) {
	
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		socket.username = username;
		socket.room = 'Discussion room';
		usernames[username] = username;
		socket.join('Discussion room');
		socket.emit('updatechat', 'SERVER', 'you have connected to Discussion room. For education concerns, please proceed to school chat channel. To contact admin, please proceed to Helpdesk channel.');
		socket.broadcast.to('Discussion room').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'Discussion room');
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
	
	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});
	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});
  });