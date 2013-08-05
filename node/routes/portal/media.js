var Media   = require('../../controller/Media')
  , Cameras = require('../../collection/Cameras');

module.exports = function(app, io) {
	app.get('/cameras/:id/:framerate', function(req, res, next) {
		  var camera = new Cameras.get(req.params.id).toJSON();

		  console.log(camera);

		  Media.proxy(req, res, camera, io);
	});
};