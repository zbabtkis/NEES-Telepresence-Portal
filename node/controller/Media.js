var MjpegProxy      = require('mjpeg-proxy').MjpegProxy
  , ProxyEmitter    = require('mjpeg-proxy').emitter
  , Cameras         = require('../collection/Cameras')
  , http            = require('http')
  , _               = require('underscore');

exports.proxy = function(req, res, camera) {
	var framerate = parseInt(req.params.framerate) ? parseInt(req.params.framerate) : null
	  , type = parseInt(framerate) ? 'mjpeg' : 'jpeg'
	  , reqString = 'http://tpm.nees.ucsb.edu/feeds/'
	  , getData = '?status_frame=true&amp;random=' + Math.random()
	  , reqArr;

	reqArr = [
		camera.site_name
	  , camera.camera_name
	  , type
	  , framerate
	];

	if (framerate > 0) {
		proxyVideo(req, res, reqString, reqArr, getData);
	} else {
		proxyImage(req, res, reqString, reqArr, getData);
	}
}

/**
 * PRIVATE FUNCTIONS
 */

function proxyImage(req, res, reqString, reqArr, getData) {

	http.get(reqString + _.compact(reqArr).join('/') + getData, function(response) {
		response.on('data', function(chunk) {
			res.write(chunk);
		});

		response.on('end', function() {
			res.end();
		});
	});
}

function proxyVideo(req, res, reqString, reqArr, getData) {
	var proxyID
	  , proxy;

	proxyID = new Date().valueOf();

	// Convert array into telepresence URL.
	reqString = reqString + reqArr.join('/') + getData;

	ProxyEmitter.register(req.query.socketID, proxyID);
	// Create new proxy for current client.
	proxy = new MjpegProxy(reqString, req.query.socketID, proxyID);
	// Make request to telepresence server.
	proxy.proxyRequest(req, res);

	ProxyEmitter.get(req.query.socketID, proxyID).once('streamEnded', function() {
		console.log('stream ended');
	});
}