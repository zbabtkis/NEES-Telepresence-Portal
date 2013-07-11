var Screenshot   = require('../model/Screenshot')
  , Emitter      = require('events').EventEmitter
  , spawn        = require('child_process').spawn
  , _            = require('underscore')
  , fs           = require('fs');

require('date-utils');

_.mixin({
	abbreviate: function(str) {
		return str.match(/\b([A-Z])/g).join('');
	}
});

module.exports = (function() {
	var sessions = {};

	// Private functions

	function __buildPackage(sid) {
		var src     = __dirname + '/../public/screenshots/' + sid
		  , dest    = __dirname + '/../public/archives/' + sid + '.tar.gz'
		  , emitter = new Emitter();
		
		// Begin file zipping child process.
		var process = spawn('tar', ['zcfC', dest, src, '.']);

		process.on('exit', function() {
			emitter.emit('gzip.ready');
		});

		return {
			link: dest,
			emitter: emitter
		};
	}

	// Public functions

	function create(reqInfo) {
		var date = new Date()
		  , id = date.getTime()
		  , resource;

		resource = new Screenshot({
			date: date,
			kendo: {
				title: _.abbreviate(reqInfo.siteName) + ' (' + reqInfo.cameraName + ')',
				time: date.toFormat("H:MI:SS PP")
			},
			sid: reqInfo.sid,
			id: id
		});

		sessions[reqInfo.sid] = sessions[reqInfo.sid] || {};

		sessions[reqInfo.sid][id] = resource;

		return resource;
	}

	function cleanUp(sid, id) {
		var dir = __dirname + '/../public/screenshots/' + sid
		  , file = dir + '/' + id;

		fs.unlink(file, function() {
			fs.rmdir(dir, function(err) {
				if(!err) {
					console.log('All of' + sid + "'s files have been cleaned up.");
				}
			});
		});
	}

	function getOne(sid, id) {
		return sessions[sid][id];
	}

	function getAll(sid) {
		return sessions[sid];
	}

	function getPackage(sid) {
		return __dirname + '/../public/archives/' + sid;
	}

	function retrieve(sid) {
		return __buildPackage(sid);
	}

	return {
		getOne: getOne,
		getAll: getAll,
		create: create,
		retrieve: retrieve,
		cleanUp: cleanUp
	}
}());