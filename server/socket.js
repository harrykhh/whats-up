var config = require('../server/config/config.json');
const redis = require('redis');

function log(type, msg) {

    var color   = '\u001b[0m',
        reset = '\u001b[0m';

    switch(type) {
        case "info":
            color = '\u001b[36m';
            break;
        case "warn":
            color = '\u001b[33m';
            break;
        case "error":
            color = '\u001b[31m';
            break;
        case "msg":
            color = '\u001b[34m';
            break;
        default:
            color = '\u001b[0m'
    }

    console.log(color + '   ' + type + '  - ' + reset + msg);
}

module.exports = function(server){
	var io = require('socket.io').listen(server);

	var AllClients = {};
	var online_count = 0;
	var db_status = {};
	var internet_rt = {};
	var db2_rt = {};
	var oracle_rt = {};
	var td_rt = {};

	io.sockets.on('connection', function(socket) {
		// create a redis connection
		try
		{
			const subscribe = redis.createClient( config.redis_port, config.redis_url );
		}
		catch (err)
		{
			console.log( "ERROR => Cannot connect to Redis message broker: URL => " + config.redis_url + "; Port => " + config.redis_port );
			console.log(err);
		}

		if (socket.id in AllClients ){ // if user is in usersObj, save it's new socket.id
			AllClients[socket.id].push(socket);
		} else { // if user is not in usersObj, make a new object and save it's socket.
			console.log(socket.id + '  connected!');
			AllClients[socket.id] = socket;
		}
		online_count++;
		socket.on('join room', function(room) {
			socket.join(room);
			subscribe.subscribe(room);
			//log('info', "Subscribed : " + room);
		});

		subscribe.on("message", function(channel, message) {
			io.sockets.in(channel).emit(channel, JSON.parse(message));
			switch (channel) {
				case 'Internet':
					internet_rt = JSON.parse(message);
					break;
				case 'database status':
					db_status = JSON.parse(message);
					break;
				case 'DB2':
					db2_rt = JSON.parse(message);
					break;
				case 'Oracle':
					oracle_rt = JSON.parse(message);
					break;
				case 'Teradata':
					td_rt = JSON.parse(message);
					break;
			}
			//log('msg', "received from channel #" + channel + " : " + message);
		});

		io.sockets.in('online count').emit('online count', online_count);
		AllClients[socket.id].emit('online count', online_count);
		AllClients[socket.id].emit('Internet', internet_rt);
		AllClients[socket.id].emit('database status', db_status);
		AllClients[socket.id].emit('DB2', db2_rt);
		AllClients[socket.id].emit('Oracle', oracle_rt);
		AllClients[socket.id].emit('Teradata', td_rt);

		socket.on('disconnect', function() {
			subscribe.quit();
			console.log(socket.id + ' got disconnect!');
			delete AllClients[socket.id];
			online_count--;
			io.sockets.in('online count').emit('online count', online_count);
		});

	});

};
