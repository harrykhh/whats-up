var mongoose = require('mongoose');
// Define user model
var UserSchema = new mongoose.Schema({
	id: String,
	firstName : String,
	lastName : String,
	title : String,
	email : String,
	gravatar : String,
	publicApps : [String],
	privateApps : [String],
	updateTimeStamp : { type: Date, default: Date.now }
});
var user = mongoose.model('user', UserSchema);

module.exports = {
	user: user
}
