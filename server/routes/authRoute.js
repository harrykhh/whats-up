var config = require('../config/config.json');
var passport = require('passport');
var LdapStrategy = require('passport-ldapauth').Strategy;
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
require('../config/mongo.js');
var userModel = require('../models/user.js').user;

module.exports = function(app){

	passport.use(new LdapStrategy(config.LDAPPassportConfig, function(profile, done) {
				userModel.findOneAndUpdate({ id: profile.sAMAccountName}, 
																		{
																			id : profile.sAMAccountName,
																			firstName : profile.givenName,
																			lastName : profile.sn,
																			title : profile.title,
																			email : profile.mail,
																			updateTimeStamp : Date.now()
																		}
				, { new: true, upsert: true }, function(err, obj) {
					if (err) done(err);
					return done(null, obj);
				});
	}
	));
	
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function (id, done) {
		userModel.findById(id._id, function (err, user) {
			done(err, user);
		});
	});

	app.use(cookieParser());
	app.use(bodyParser.json());		// to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies

	app.use(session({ secret: 'whatsup', saveUninitialized: true, resave: true }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());

	app.get('/login', function(req, res, next) {
		if (req.user){
			var backURL = req.headers.referer || '/';
			return res.redirect(backURL);
		}
		res.render('login', { title: "Login", version: config.version});
	});
	app.post('/login', function(req, res, next) {
		passport.authenticate('ldapauth', function(err, user, info) {
			if (err) { return next(err) }
			if (!user) {
				// *** Display message without using flash option
				// re-render the login form with a message
				return res.render('login', { title: "Login", version: config.version, message: info});
			}
			req.logIn(user, function (err) {
				if (err) { return next(err); }
			});
			return res.redirect('/');
		})(req, res, next);
	});
	
	app.get('/logout', function(req, res, next) {
		req.logout();
		res.redirect('/');
	});
};