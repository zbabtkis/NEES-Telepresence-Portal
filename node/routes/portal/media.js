var Media = require('../../controller/Media');

module.exports = function(app, io) {
	app.get('/cameras/:cam_id/:framerate', Media.proxy);
};