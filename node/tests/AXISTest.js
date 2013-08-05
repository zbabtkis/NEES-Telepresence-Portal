/** 
 * AXIS Model unit tests
 *
 * @author     Zachary Babtkis <zackbabtkis@gmail.com>
 * @lang       node.js
 * @license    MIT
 *
 * Last modified July 29 2013
 */

var AXIS   = require('../model/Axis.js')
  , Camera = require('../model/Camera.js');

/**
 * AXIS.center tests.
 */

exports.testCenter = function(test) {
	var axis = new AXIS("192.168.10.1");

	test.ok(axis.center(99, 30), "Accepts integer vals");
	test.done();
}

exports.testCenterOutOfRangeInt = function(test) {
	var axis = new AXIS("192.168.10.1");

	test.notEqual(axis.center(101, -2), true, "Does not accept out of range integers");
	test.done();
}

exports.testCenterNonInt = function(test) {
	var axis      = new AXIS("192.168.10.1");

	test.notEqual(axis.center('two','three'), true, "Doesn't accept non integers");
	test.done();
}

/** 
 * AXIS Move tests.
 */

exports.testMove = function(test) {
	var camera = new Camera({
			id: 1
		  , ip: "192.168.10.1"
		  , site_name: "Wildlife Liquefaction Array"
		  , camera_name: "Full-Size"
		})
	  , actions = {
	  	pan: 179,
	  	til: -20
	  };

	test.ok(camera.move(actions), "Camera can be moved using normal coordinates");
	test.done();
}
exports.testMoveOutOfRange = function(test) {
	var camera = new Camera({
			id: 1
		  , ip: "192.168.10.1"
		  , site_name: "Wildlife Liquefaction Array"
		  , camera_name: "Full-Size"
		})
	  , actions = {
	  	pan: 199,
	  	til: -200
	  };

	test.throws(function() { camera.move(actions); }, Error, "Camera can be moved using normal coordinates");
	test.done();
}