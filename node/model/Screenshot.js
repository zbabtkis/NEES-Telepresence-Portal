var Emitter = require('events').EventEmitter
  , fs      = require('fs')
  , _       = require('underscore');

require('date-utils');

// Savable image resource file.
module.exports = function(obj) {
		var sessionScratch
		  , filename
		  , emitter = new Emitter();

		_.extend(this, obj);
		sessionScratch = __dirname + '/../public/screenshots/' + this.sid;
		filename       = sessionScratch + '/' + this.kendo.title + '-' + this.date.toFormat("M-D-YYYY - H.MI.SS PP") + '.jpeg';

		function __createDir(data) {
			fs.exists(sessionScratch, function(exists) {
				if(!exists) {
					fs.mkdir(sessionScratch, function() {
						writeFile(data)
					});
				}
			});

			return sessionScratch;
		}

		function writeFile(data) {
			fs.writeFile(filename, data, 'binary', function(err) {
				if(err) {
					__createDir(data);
				} else {
					emitter.emit('imageWritten');
				}
			});

			return filename;
		}

		return {
			writeFile: writeFile,
			emitter: emitter,
			kendo: this.kendo
		}
	}