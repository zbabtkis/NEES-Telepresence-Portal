var Screenshots    = require('../../collection/Screenshots')
  , Cameras         = require('../../collection/Cameras')
  , fs              = require('fs')
  , http            = require('http')
  , _               = require('underscore');

module.exports = function(app, io) {
	app.get('/screenshots', function(req, res, next) {
		var sid = req.query.socketID,
			screenshots = Screenshots.getAll(sid);

		res.end(JSON.stringify({
			"results": _.map(screenshots, function(obj) { return obj.kendo; })
		}));
	});

	app.get('/screenshots/retrieve', function(req, res, next) {
		var file = Screenshots.retrieve(req.query.socketID);

		res.attachment('EEG-Telepresence-' + new Date().toUTCString() + '.tar.gz');

		file.emitter.on('gzip.ready', function() {
			fs.readFile(file.link, function(err, data) {
				res.end(data);
			});
		});
	});

	app.get('/screenshots/:id', function(req, res, next) {
		var reqString = 'http://tpm.nees.ucsb.edu/feeds/';

		// Query database for stream info
		var camera = new Cameras.get(req.params.id).toJSON();

		// When query comes back build the URL request string and create proxy.
		var reqArr, getData = '?status_frame=true&amp;random=' + Math.random();

		reqObj = {
			  siteName: camera.site_name
			, cameraName: camera.camera_name
			, type: 'jpeg'
		};

		reqString = reqString + _.toArray(reqObj).join('/');

		// Provide session info for Screenshots.
		reqObj.sid     = req.query.socketID;
		req.screenshot = reqObj;

		http.get(reqString, function(image) {
			saveImage(image, req, res);
		});
	});

	/**
	 * PRIVATE FUNCTIONS
	 */

	// Saves image to temp directory from proxy response.
	function saveImage(imageResponse, req, res) {
		var data = '';

		imageResponse.setEncoding('binary');

		imageResponse.on('data', function(chunk) {
			data += chunk;
		});

		imageResponse.on('end', function() {
			var sc = Screenshots.create(req.screenshot);

			sc.writeFile(data);

			sc.emitter.on('imageWritten', function() {
				io.sockets.in(req.sessionID).emit('alertAttachment');
				res.end();
			});

			io.sockets.in(req.sessionID).on('disconnect', function() {
				Screenshots.cleanUp(this.sid, this.id);
			});
		});
	}
}