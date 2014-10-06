var async = require("async");
var errorRoutes = require('../routes/ErrorRoutes.js');
var config = require('../config/config.json');
var log = require('../models/rt_log.js').log;
//var moment = require('moment');

var getlog = function(query, hours, done){
	log.find(query, { '_id': 0, 'TimeStamp' :1, 'ResponseTime': 1, 'Name': 1}).sort({'TimeStamp': -1}).limit(hours).lean().exec(function (err, docs) {
		if (err) return handleError(err);
		var data = [];
		docs = docs.reverse();
		docs.forEach(function(ele, key, _array) {
			Object.keys(ele.ResponseTime).forEach(function(minute, key, _array) {
				Object.keys(ele.ResponseTime[minute]).forEach(function(second, key, _array) {
					var date = new Date(ele.TimeStamp);
					var year = date.getUTCFullYear();
					var month = date.getUTCMonth();
					var day = date.getUTCDate();
					var hour = date.getUTCHours();
					var tmp = new Date(Date.UTC(year, month, day, hour, minute, second, 0));
					var obj = {Name: docs[0].Name, x: tmp, y: ele.ResponseTime[minute][second]};
					data.push(obj);
				});
			});
		});
		if (hours == 2)
			data.splice(0, data.length - 180);
		done(null, data);
	});
}

var minute_avg = function(data ,done){
	var sum = 0;
	var avg = 0.0;
	var minute_count = 0;
	var minute = data[0].x.getMinutes();
	var arr = [];
	data.forEach(function(ele, key, _array) {
		if (minute == ele.x.getMinutes()){
			sum += ele.y;
			minute_count++;
		}else{
			var date = new Date(ele.x);
			var year = date.getUTCFullYear();
			var month = date.getUTCMonth();
			var day = date.getUTCDate();
			var hour = date.getUTCHours();
			var tmp = new Date(Date.UTC(year, month, day, hour, ele.x.getMinutes(), 0, 0));
			//tmp = moment(tmp).subtract(1, 'minute').toDate();
			avg = sum / minute_count;
			var obj = {Name: data[0].Name, x: tmp, y: avg, count: minute_count};
			arr.push(obj);
			sum = ele.y;
			avg = 0.0;
			minute_count = 1;
			minute = ele.x.getMinutes();
		}
	});
	done(null, arr);
}

var hour_avg = function(dat ,done){
	async.series([
			function(done){
				minute_avg(dat, done);
			}
	],
	// optional callback
	function(err, result){
		var data = result[0];
		var sum = 0;
		var avg = 0.0;
		var hour_count = 0;
		var hour = data[0].x.getUTCHours();
		var arr = [];
		data.forEach(function(ele, key, _array) {
			if (hour == ele.x.getUTCHours()){
				sum += ele.y;
				hour_count++;
			}else{
				var date = new Date(ele.x);
				var year = date.getUTCFullYear();
				var month = date.getUTCMonth();
				var day = date.getUTCDate();
				var tmp = new Date(Date.UTC(year, month, day, ele.x.getUTCHours(), 0, 0, 0));
				//tmp = moment(tmp).subtract(1, 'hour').toDate();
				avg = sum / hour_count;
				var obj = {Name: data[0].Name, x: tmp, y: avg, count: hour_count};
				arr.push(obj);
				sum = ele.y;
				avg = 0.0;
				hour_count = 1;
				hour = ele.x.getUTCHours();
			}
		});
		done(null, arr);
	});
}

module.exports = function(app){
	app.get('/getgraphdata', function(req, res) {
    var DBType = req.query.DBType;
    var Node = req.query.Node;
		var Hours = Math.ceil(req.query.Hours);
		if (Node == DBType){
			log.aggregate(
				{ $match : { Tag: [ DBType ]}},
				{ $sort : { _id : -1 } },
				{ $group: { _id: { id: '$id', name: '$Name' } } })
			.exec(function (err, result) {
				if (err) return handleError(err);
				var json = [];
				async.eachLimit(result, 15, function(item, done) {
					var query = { Tag: [ DBType ] ,  id: item._id.id };
					async.series([
							function(done){
								getlog(query, Hours, done);
							}
					],
					// optional callback
					function(err, results){
						async.series([
								function(done){
									switch(Hours)
									{
									case 3:
											minute_avg(results[0], done);
											break;
									case 168:
											hour_avg(results[0], done);
											break;
									default:
											results[0].splice(0, results[0].length - 180);
											done(null, results[0]);
									}
								}
						],
						// optional callback
						function(err, data){
							json.push(data[0]);
							done();
						});
					});
				},
				function(err){
					res.send(json);
				});
			});
		}
		else{
			var query = { Tag: [ DBType ] , Name: Node };
			async.series([
					function(done){
						getlog(query, Hours, done);
					}
			],
			// optional callback
			function(err, data){
				async.series([
						function(done){
							switch(Hours)
							{
							case 3:
									minute_avg(data[0], done);
									break;
							case 168:
									hour_avg(data[0], done);
									break;
							default:
									data[0].splice(0, data[0].length - 180);
									done(null, data[0]);
							}
						}
				],
				// optional callback
				function(err, result){
					res.send(result[0]);
				});
			});
		}
	});

	app.get('/graph/:dbType/:node?', function(req, res) {
		var param = {};
		param.version = config.version;
		if (req.user){
			param.user = req.user;
		}
		log.distinct("Tag", function(error, results){
			if (error) return handleError(error);
			if ((results.indexOf(req.params.dbType) > -1)){
				param.title = req.params.dbType;
				log.aggregate(
					{ $match : { Tag: [ param.title ]}},
					{ $sort : { _id : -1 } },
					{ $group: { _id: { id: '$id', name: '$Name' } } })
				.exec(function (err, result) {
					if (err) return handleError(err);
					var query;
					param.path = param.title;
					if (typeof req.params.node != "undefined"){
						param.path = param.path + "/" + req.params.node;
						param.dbtype = req.params.dbType;
						var pageExists = false;
						for (var value in result){
							if (result[value]._id.id === req.params.node){
								pageExists = true;
								param.title = result[value]._id.name;
								query = { Tag: [ req.params.dbType ] , id: result[value]._id.id};
							}
						}
						if (pageExists == false)
							return errorRoutes.FileNotFound(req, res);
						async.series([
						    function(done){
									getlog(query, 2, done);
						    }
						],
						// optional callback
						function(err, results){
							param.data = results;
						  res.render('graph', param);
						});
					}
					else{
						var json = [];
						async.eachLimit(result, 15, function(item, done) {
							query = { Tag: [ param.title ] ,  id: item._id.id };
							async.series([
									function(done){
										getlog(query, 2, done);
									}
							],
							// optional callback
							function(err, results){
								json.push(results[0]);
								done();
							});
						},
						function(err){
							param.data = json;
							res.render('graph', param);
						});
					}
				});
			}
			else{
				return errorRoutes.FileNotFound(req, res);
			}
		});
	});
}
