var   MjpegProxy       = require('mjpeg-proxy').MjpegProxy
	, express          = require('express.io')
	, http             = require('http')
	, app              = express()
	, _                = require('underscore')
	, fs               = require('fs')
	, ScreenshotDS     = require('./Data/screenshot-ds.js')
	, DrupalInterface  = require('telepresence-drupal-interface');

app.http().io();
app.listen(8888);

var allowCrossOrigin = function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, XMLHttpRequest, X-HTTP-Method-Override, Content-Type");
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS')
	next();
}

app.use(allowCrossOrigin);
// Allows us to pull query strings from URL.
app.use(express.bodyParser());

app.get('/', function(req, res, next) {
	res.end(JSON.stringify({"app": true}));
});

//Forward directly to express.io route handlers.
app.get('/streams', function(req, res, next) {
	req.io.route('getCameras');
});

app.put('/streams/:stream_id', function(req, res, next) {
	console.log('about to save camera (ln 34 app.js)')
	req.io.route('saveCamera');
});

app.get('/streams/:stream_id', function(req, res, next) {
	req.io.route('getCamera');
});

app.get('/screenshots', function(req, res, next) {
	req.io.route('screenshots');
});

/**
 * Retrieve screenshots in tarball by socket id.
 */
app.get('/screenshots/retrieve', function(req, res, next) {
	var file = ScreenshotDS.retrieve(req.query.socketID);

	res.attachment('EEG-Telepresence-' + new Date().toUTCString() + '.tar.gz');

	file.emitter.on('gzip.ready', function() {
		fs.readFile(file.link, function(err, data) {
			res.end(data);
		});
	});
});

/**
 * Handle initialization of stream proxy and pass proxy object onto 
 * express.io route for listening/emitting events.
 */
app.get('/streams/:cam_id/:framerate/:screenshot?', function(req, res,next) {
	var   camId = req.params.cam_id
		, framerate = parseInt(req.params.framerate) ? parseInt(req.params.framerate) : null
		, type = parseInt(framerate) ? 'mjpeg' : 'jpeg'
		, reqString = 'http://tpm.nees.ucsb.edu/feeds/'
		, proxy;

	// Query database for stream info
	var query = new DrupalInterface.Query(camId);

	// When query comes back build the URL request string and create proxy.
	query.on('results:available', function(results) {
		var reqArr, getData = '?status_frame=true&amp;random=' + Math.random();

		function takeScreenshot() {
			reqObj = {
				  siteName: results.site_name
				, cameraName: results.camera_name
				, type: 'jpeg'
			};
			reqString = reqString + _.toArray(reqObj).join('/');

			http.get(reqString, __saveImage);
		}

		function proxyVideo() {
			// Build request array.
			reqArr = [
				  results.site_name
				, results.camera_name
				, type
				, framerate
			];

			// Convert array into telepresence URL.
			reqString = reqString + reqArr.join('/') + getData;

			console.log(reqString + '(ln 102 app.js)');
			// Create new proxy for current client.
			req.proxy = new MjpegProxy(reqString);
			// Make request to telepresence server.
			req.proxy.proxyRequest(req, res, next);

			req.io.route('initializeProxyStream');
		}

		function proxyImage() {
			reqArr = [
				  results.site_name
				, results.camera_name
				, type
			];

			http.get(reqString + reqArr.join('/') + getData, function(response) {
				response.on('data', function(chunk) {
					res.write(chunk);
				});

				response.on('end', function() {
					res.end();
				});
			});
		}

		function __saveImage(response) {
			var data = '';
			// Provide session info for ScreenshotDS.
			reqObj.sid = req.query.socketID;
			response.setEncoding('binary');

			response.on('data', function(chunk) {
				data += chunk;
			});

			response.on('end', function() {
				var sc = ScreenshotDS.create(reqObj);

				sc.writeFile(data);

				sc.emitter.on('imageWritten', function() {
					req.io.route('alertAttachment');
				});

				app.io.sockets.sockets[reqObj.sid].on('disconnect', function() {
					ScreenshotDS.cleanUp(reqObj.sid, reqObj.id);
				});
			});
		}

		if(req.params.screenshot) {
			takeScreenshot();
		} else if (framerate > 0) {
			proxyVideo();
		} else {
			proxyImage();
		}
	});
});

/**
 * Socket.io event broadcasting and emitting
 */

app.io.route('getCamera', function(req) {
	var query = new DrupalInterface.Query(req.params.stream_id);

	console.log(query + ' (ln 171 app.js)');

	query.on('results:available', function(results) {
		req.io.respond(results);
	});
});

app.io.route('getCameras', function(req) {
	var query = new DrupalInterface.Query();

	// Find all cameras in database and return in JSON string when available.
	query.on('results:available', function(results) {
		req.io.respond(results);
	});

	app.io.sockets.on('requestGlobalUpdate', function(id) {
		req.io.broadcast('cameraUpdated:' + id)
	});
});

app.io.route('saveCamera', function(req, res) {
	var Saver = new DrupalInterface.Saver(req.body);

	console.log('save requested (ln 194 app.js)');

	Saver.save();

	// If camera is up to date -- respond with nothing.
	Saver.emitter.on('noUpdates', function() {
		req.io.respond('end');
	});

	Saver.emitter.on('cameraUpdated', function(id) {
		// Alert all connected clients that camera camera placement has been updated.
		console.log('broadcasting camera changes to clients' + '(ln 200)');
		req.io.broadcast('cameraUpdated:' + id);
		
		// End HTTP response.
		req.io.respond('end');
	});
});

app.io.route('initializeProxyStream', function(req) {
	var socket = app.io.sockets.sockets[req.query.socketID];

	// If connecting directly to /stream don't try to listen for socket connection.
	req.proxy.once('streamEnded', function() {
		socket.emit('streamEnded:' + req.params.cam_id);
	});

});

app.io.route('alertAttachment', function(req) {
	var socket = app.io.sockets.sockets[req.query.socketID];

	socket.emit('alertAttachment');

	req.io.respond('end');
});

app.io.route('screenshots', function(req) {
	var sid = req.query.socketID,
		screenshots = ScreenshotDS.getAll(sid);

	req.io.respond({
		"results": _.map(screenshots, function(obj) { return obj.kendo; })
	});
})