var config = require('../config/config.json');
var errorRoutes = require('../routes/ErrorRoutes.js');
var gravatarjs = require('gravatar');
var userModel = require('../models/user.js').user;

module.exports = function(app){
	/* GET profile. */
	app.get('/profile', isLoggedIn, function(req, res) {
		var param = {};
		param.title = req.user.firstName + "'s Profile";
		param.user = req.user;
		param.version = config.version;
		if (true)
			res.render('profile', param);
		else{
			errorRoutes.FileNotFound(req, res);
		}
	});
	
	/* POST profile. */
	app.post('/profile', isLoggedIn, function(req, res) {
		var param = {};
		param.title = req.user.firstName + "'s Profile";
		param.version = config.version;
		param.message = {};
		param.message.icon = 'fa-check';
		param.message.type = 'success';
		param.message.content = 'Your changes have been saved.';
		var gravatarUrl = gravatarjs.url(req.body.gravatar.trim());
		var update = {};
		update = { gravatar: gravatarUrl, updateTimeStamp : Date.now() };
		if (req.body.gravatar.trim().length == 0){
			update = { $unset: { gravatar: 1 } };
		}
		userModel.findOneAndUpdate({ id: req.user.id }, update, function(err, user) {
			if (err){
				param.message.icon = 'fa-ban';
				param.message.type = 'danger';
				param.message.content = 'Error has occued trying to save your data, please try again.';
			}
			param.user = user;
			return res.render('profile', param);
		});
	});
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the Login in Page
	return res.render('login', { title: "Login", version: config.version, message: "You need to be logged in to perform the following function." });
}