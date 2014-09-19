var config = require('../config/config.json');
var errorRoutes = require('../routes/ErrorRoutes.js');
var log = require('../models/rt_log.js').log;

module.exports = function(app){
	app.get('/database/:dbType', function(req, res) {
		var param = {};
		param.title = req.params.dbType;
		param.version = config.version;
		if (req.user){
			param.user = req.user;
		}
		log.distinct("Tag", function(error, results){
			if (error) return handleError(error);
			if ((results.indexOf(req.params.dbType) > -1)){
				log.aggregate(
					{ $match : { Tag: [ param.title ]}},
					{ $sort : { _id : -1 } },
					{ $group: { _id: { id: '$id', name: '$Name' } } })
				.exec(function (err, result) {
					if (err) return handleError(err);
					param.data = [];
					result.forEach(function(item) {
						param.data.push(item._id);
					});
					res.render('database', param);
				});
			}
			else{
				errorRoutes.FileNotFound(req, res);
			}
		});
	});
}