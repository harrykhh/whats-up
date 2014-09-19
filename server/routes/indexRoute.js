var config = require('../config/config.json');
var errorRoutes = require('../routes/ErrorRoutes.js');
var userModel = require('../models/user.js').user;
var log = require('../models/rt_log.js').log;
var async = require("async");

module.exports = function(app){
	/* GET home page. */
	app.get('/', function(req, res) {
		var param = {};
		param.title = "What's Up?";
		param.version = config.version;
		if (req.user){
			param.user = req.user;
		}
		async.parallel([
			//Count Server Nodes
			function(done) {
				log.distinct("id", { Tag: {'$ne': "Internet" } }, function(error, results){
					if (error) return handleError(error);
					param.dbNodeCount = results.length;
					done();
				});
			},
			//Load posts
			function(done) {
				log.distinct("Tag", { Tag: {'$ne': "Internet" } }, function(error, results){
					if (error) return handleError(error);
					param.dbTypeCount = results.length;
					done();
				});
			}
		], function(err) { //This function gets called after the two tasks have called their "task callbacks"
			if (err) return next(err); //If an error occured, we let express/connect handle it by calling the "next" function
			//Here locals will be populated with 'user' and 'posts'
			res.render('index', param);
		});
	});
	/* GET socket.js. */
	app.get('/js/socket.js', function(req, res) {
		res.render('partials/socket');
	});
}