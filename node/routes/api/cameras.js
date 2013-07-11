var Cameras = require('../../collection/Cameras');

module.exports = function(app, io) {
	Cameras.sync();
	Cameras.poll();
	
	/**
	 * Camera related routes
	 */

	// Get all cameras.
	app.get('/cameras', function(req, res, next) {
		res.end(JSON.stringify(Cameras.toJSON()));
	});

	// Get one camera by ID.
	app.get('/cameras/:id', function(req, res, next) {
		res.end(JSON.stringify(Cameras.get(req.params.id).toJSON()));
	});

	// Save new camera coordinates.
	app.put('/cameras/:id', function(req, res, next) {
		var camera = Cameras.get(req.params.id);

		camera.move(req.body);
		Cameras.sync();

		res.end()
	});

	// Center camera on viewport coordinate.
	app.put('/cameras/:id/center', function(req, res, next) {
		// Calculate new point by x,y vals between 0-100.
		Cameras.get(req.params.id).center(req.body.left, req.body.top);

		res.end();
	});

	/**
	 * IO Events
	 */

	Cameras.on('change', function(model) {
		io.sockets.emit('change:' + model.id);
	});
}