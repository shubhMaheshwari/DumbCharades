// This section defines the controller for user survey on action recongnition

// Sections 
// 1. Imports and parameters
// 2. Connection to monogdb and google-auth
// 3. Routes
// 4. Start server using app.listen

// Controllers
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var session = require('express-session');

// File system manager
var fs = require('fs');
// Utilities
var util = require('util')

// Database client
const MongoClient = require('mongodb').MongoClient;

// Google authentication
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth20').Strategy;

// Define app
var app = express();


// Configure app
// configure Express

// Views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Statics
app.use(express.static('static'));

// Parser for ejs
app.use(bodyParser.urlencoded({
extended: true
}));

// Use ejs as engine
app.use(bodyParser.json()); 

app.use(cookieParser());
app.use(methodOverride());
app.use(session({
  secret: 'charades',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

// Load all filenames 
bvh_files = fs.readdirSync('./static/bvh_models');

// Global Parameters
port = 9090;
// WARNING: app.listen(80) will NOT work here!

// Store user inputs
user_survey = [];

// Save length (update json file when user_servey.length > save_length)
save_length = 2;

// Index for saving file, change it after each update
current_index = 0;


// Connect to Database
const mongo_url = 'mongodb://localhost:27017';
const dbName = 'charades_label';

MongoClient.connect(mongo_url, function(err, client) {
  // Use the admin database for the operation
  const adminDb = client.db(dbName).admin();
  // List all the available databases
  adminDb.listDatabases(function(err, dbs) {
  	if(err)
 	 	console.log("Error while connecting to db:",err);
    
    console.log("Total databases:", dbs.databases.length );
    client.close();
  });
});

// Connect to google auth

//   Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// 	Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}


// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new GoogleStrategy({
	clientID: '815886444860-da8she5k79pp3gi8gitb5evp0k2kggrs.apps.googleusercontent.com',
	clientSecret: '9_Z_5dKU-n8flrPDgs6ZBYRv',
    callbackURL: 'http://localhost:' + port + '/auth/google/return',
    realm: 'http://localhost:' + port +  '/'
  },
  function(identifier, refresh_token,profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.

      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));


// Get request to home
// Return a random filename to render
// app.get('/', ensureAuthenticated, function (req, res) {
app.get('/',  function (req, res) {
	console.log(current_index);
	var bvh_filename = bvh_files[current_index].split('.')[0];
	var new_name = bvh_filename.split('_').join(' ');

	res.render('load_bvh.ejs', {'bvh': bvh_filename,'new_name':new_name, 'use_vr': false});
});

app.get('/login', function(req, res){
  res.redirect('/auth/google');
});

// Save submission by the user 
// app.post('/submit_answer', ensureAuthenticated, function (req, res) {
app.post('/submit_answer',  function (req, res) {
	if (req.body.old_name !== bvh_files[current_index].split('.')[0]){
		res.redirect('/');
	}


	else{

		// Reduce database size
		current_index += 1;

		// Clean new filename
		req.body.new_name = req.body.new_name.trim().split(' ').join('_')
		MongoClient.connect(mongo_url, function(err, client) {
		  // Create a collection we want to drop later
		  var col = client.db(dbName).collection('creatLabel');
		  // Insert a bunch of documents
		  var store_data = req.body;

		  // store_data.user = req.user.displayName;
		  store_data.user = "Shubh";

		  col.insert([req.body], function(err, result) {
		    if(err)
 	 			console.log("Error while connecting to db:",err);
		    // List the database collections available
		    col.find({}).toArray(function(err, items) {
			    client.close();
			  });

		  });
		});

		res.redirect('/');
	}
});


// List all the submissions by users as a json 
app.get('/list', function (req, res) {
	console.log("Here");
	MongoClient.connect(mongo_url, function(err, client) {
	  // Create a collection we want to drop later
	  var col = client.db(dbName).collection('creatLabel');
	  
	    // List the database collections available
      col.find({}).toArray(function(err, items) {
		    client.close();
    		res.json(items);
		  });
	
	});
  
});




// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authenticating, Google will redirect the
//   user back to this application at /auth/google/return
app.get('/auth/google', 
  passport.authenticate('google', { failureRedirect: '/login',scope: 'https://www.googleapis.com/auth/plus.login' }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/google/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


app.listen(port, ()=>  console.log("Example app listening on port:", port))


