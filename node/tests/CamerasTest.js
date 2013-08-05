var Cameras = require("../collection/Cameras")
  , _       = require("underscore");

exports.testFetchCameras = function(test) {
	Cameras.sync();

	setTimeout(function() {
		var all = Cameras.toJSON();

		test.ok(!(_.isEmpty(all)), "Cameras can be fetched");
		test.done();
	});
}