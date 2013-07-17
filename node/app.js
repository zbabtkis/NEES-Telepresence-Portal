var express          = require('express')
  , app              = express()
  , server           = require('http').createServer(app)
  , io               = require('socket.io').listen(server);

server.listen(8888);

/**
 * App Middlewear
 */
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, XMLHttpRequest, X-HTTP-Method-Override, Content-Type");
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS')
	next();
});

// Allows us to pull query strings from URL.
app.use(express.bodyParser());

/**
 * Require Socket.IO connection before routing
 */
app.use(function(req, res, next) {
	io.on('connection', function(socket) {
		socket.join(socket.handshake.sessionID);
	});

	next();
});

/**
 * Initialize Routes
 */
require('./routes/api')(app, io);
require('./routes/portal')(app, io);