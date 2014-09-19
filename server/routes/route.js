require('../config/mongo.js');
module.exports = function(app){
	require('../routes/authRoute.js')(app);

	require('../routes/indexRoute.js')(app);
	
	require('../routes/profileRoute.js')(app);
	
	require('../routes/databaseRoute.js')(app);

	require('../routes/graphRoute.js')(app);

	require('../routes/ErrorRoutes.js').Errors(app);
}