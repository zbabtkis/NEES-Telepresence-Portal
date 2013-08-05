/** 
 * Camera Model unit tests
 *
 * @author     Zachary Babtkis <zackbabtkis@gmail.com>
 * @lang       node.js
 * @license    MIT
 *
 * Last modified July 29 2013
 */

var Cameras     = require("../collection/Cameras")
  , Camera      = Cameras.get(1)
  , _           = require('underscore')
  , currentVals;

Cameras.sync();

/**
 * WARNING -- tons of setTimeouts below!
 * -------------------------------------
 * Make sure async db/http calls complete before checking equality.
 */

module.exports = {
	setUp: function(callback) {

		setTimeout(function() { Camera = Cameras.get(1); }, 200);

		setTimeout(function() {
			// Get initial position of camera for comparing with moved position.
			currentVals  = _.clone(Camera.toJSON());

			// Ensure camera isn't already at position we are moving it to.
			Camera.move({
				pan: 0
			  , tilt: 0
			});

			callback();
		}, 1000);
	},
	tearDown: function(callback) {

		setTimeout(function() {
			// Move camera back to initial position (in case someone was watching!).
			Camera.move({
				pan: currentVals.pan
			  , tilt: currentVals.tilt
			});

			callback();
		}, 1000)

	},
	testMove: function(test) {
		// Where we are moving the camera for the test.
		var loc = {
			pan: 170
		  , tilt: 100
		};

		setTimeout(function() {
			Camera.move(loc);
			// Get current position of camera according to AXIS HTTP API.
			Camera.sync()

			setTimeout(function() {
				test.ok(function() {
					// Position after move should be different than initial.
					return _.isEqual(Camera.toJSON(), currentVals) === false;
				}, "Camera can move!");
				test.done();
			}, 500);
		}, 1000);
	}
}