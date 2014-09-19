var express = require('express');
var path = require('path');
var app = express();

//var morgan  = require('morgan');
//app.use(morgan('combined'));

// view engine setup
app.set('views', path.join(__dirname, '/server/views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/server/public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

require('./server/routes/route.js')(app);

var server = app.listen(3000, function() {
	console.log('Listening on port 3000');
});

require('./server/socket.js')(server);
