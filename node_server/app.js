var MjpegProxy = require('mjpeg-proxy').MjpegProxy,
	express    = require('express.io'),
	app        = express(),
	fs         = require('fs'),
	// Module that allows us to fetch telepresence related
	// content from Drupal DB.
	drupal_tp  = require('telepresence-drupal-interface');

app.http().io();
app.listen(8888);

var allowCrossOrigin = function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://snow-dev.eri.ucsb.edu");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, XMLHttpRequest, X-HTTP-Method-Override, Content-Type");
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS')
	next();
}

// Allows us to pull query strings from URL.
app.use(express.bodyParser());

// Enables cookie parsing and handshaking for express/socket.io
app.use(express.cookieParser());
app.use(express.session({secret: 'angry earthquakes'}));

// Allow all cross origin requests.
app.use(allowCrossOrigin);

app.get('/', function(req, res, next) {
	req.io.route('nodeCheck');
});

app.get('/streams', function(req, res, next) {
	req.io.route('allCameras');
});

app.put('/streams/:stream_id', function(req, res, next) {
	req.io.route('saveCamera');
});

app.get('/streams/:stream_id', function(req, res, next) {
	req.io.route('getCamera');
});

/**
 * Handle initialization of stream proxy and pass proxy object onto 
 * express.io route for listening/emitting events.
 */
app.get('/streams/:cam_id/:framerate', function(req, res,next) {
	var camId = req.params.cam_id,
		framerate = req.params.framerate,
		type = (framerate === 0) ? 'jpeg' : 'mjpeg',
		reqString = 'http://tpm.nees.ucsb.edu/feeds/',
		proxy;

	// Query database for stream info
	var query = new drupal_tp.Query(camId);

	// When query comes back build the URL request string and create proxy.
	query.on('results:available', function(results) {
		var reqArr = [
			  results.site_name
			, results.camera_name
			, type
			, framerate
		];

		reqString = reqString + reqArr.join('/') + '?status_frame=true&amp;random=' + Math.random();

		// Create new proxy for current client.
		req.proxy = new MjpegProxy(reqString);

		// Make request to telepresence server.
		req.proxy.proxyRequest(req, res, next);

		// Forward to express.io route for emitting stream event info to clients.
		req.io.route('initializeProxyStream');
	});
});

app.io.route('nodeCheck', function(req) {
	var response = {
		'NodeJS': true
	};

	// This can be anything -- all client-side needs is 200 status response.
	req.io.respond(response);
});

app.io.route('allCameras', function(req) {
	var query = new drupal_tp.Query();

	// Find all cameras in database and return in JSON string when available.
	query.on('results:available', function(results) {
		req.io.respond(results);
	});
});

app.io.route('getCamera', function(req) {
	var query = new drupal_tp.Query(req.params.stream_id);

	query.on('results:available', function(results) {
		req.io.respond(results);
	});
});

app.io.route('saveCamera', function(req, res) {
	console.log(req.body);
	var Saver = new drupal_tp.Saver(req.body);

	Saver.save();

	Saver.emitter.on('cameraUpdated', function(id) {
		// Alert all connected clients that camera camera placement has been updated.
		req.io.broadcast('cameraUpdated:' + id);
		
		// End HTTP response.
		req.io.respond('');
	});
});

app.io.route('initializeProxyStream', function(req) {
	var socket = app.io.sockets.sockets[req.query.socketID];
	// If connecting directly to /stream don't try to listen for socket connection.
	if(req.io) {
		req.proxy.once('streamEnded', function() {
			socket.emit('streamEnded');
		});
	}
});