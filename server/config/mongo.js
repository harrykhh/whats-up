var mongoose = require('mongoose');
var config = require('../config/config.json');
var url = config.mongodb_url;
var options = {
	user: config.mongodb_user,
	pass: config.mongodb_password,
	auto_reconnect: true,
	safe: true
};
var db = mongoose.connection;
db.on('error', function () {
	console.error.bind(console, 'Mongodb connection error');
});
db.once('open', function () {
	console.info('Mongoose connected at: ', url);
});
db.on('disconnected', function () {
	console.info('Mongoose default connection disconnected');
});
process.on('SIGINT', function() {
	db.close(function () {
		console.info('Mongoose default connection disconnected through app termination');
		process.exit(0);
	});
});
try {
	mongoose.connect(url, options);
} catch(err) {
	console.error(err);
}