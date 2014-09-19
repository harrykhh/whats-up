var version = require('../config/config.json').version;
module.exports = {
	Errors: function(app){
								// Handle 404
								app.use(function(req, res, next) {
									module.exports.FileNotFound(req, res);
								});

								// Handle 500
								app.use(function(error, req, res, next) {
									module.exports.InternalError(error,req, res);
								});
							},
	FileNotFound : function(req, res){
								var param = {};
								param.title = "404 Page Not Found";
								param.version = version;
								param.error = "Page Not Found";
								if (req.user){
									param.user = req.user;
								}
								res.status(404);
								// respond with html page
								if (req.accepts('html')) {
									res.render('errors/404', param);
									return;
								}

								// respond with json
								if (req.accepts('json')) {
									res.send({ error: 'Not found' });
									return;
								}

								// default to plain-text. send()
								res.type('txt').send('Not found');
							},
	InternalError : function(error, req, res){
								console.error('500 Error occured');
								console.error(error);
								
								var param = {};
								param.title = "500 Error Page";
								param.version = version;
								param.error = "Internal Server Error";
								if (req.user){
									param.user = req.user;
								}
								res.status(500);
								
								// respond with html page
								if (req.accepts('html')) {
									res.render('errors/500', param);
									return;
								}
								// respond with json
								if (req.accepts('json')) {
									res.send({ error: 'Error' });
									return;
								}

								// default to plain-text. send()
								res.type('txt').send('Error');
						}
}