var mongoose = require('mongoose');
// Define Log model
var LogSchema = new mongoose.Schema({
	id: String,
	Name : String,
	TimeStamp : { type: Date, default: Date.now },
	Tag : [String],
	ResponseTime: {}
});
var log = mongoose.model('log', LogSchema);

module.exports = {
	log: log
}
