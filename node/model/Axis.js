var Emitter = require('events').EventEmitter
  , http    = require('http')
  , _       = require('underscore')
  , Winston = require('winston');

var logger = new (Winston.Logger)({
	transports: [
		new (Winston.transports.File)({ filename: 'AXIS.log' })
	]
});

module.exports = function(ip) {
	var _axisConnect  // -()
	  , _axisParse    // -()
	  , axisSync      // +()
	  , axisCenter    // +()
	  , axisMove      // +()
	  , axisAutoFocus // +()
	  , axisAutoIris  // +();

	/**
	 * Private functions based on AXIS HTTP address.
	 */

	// Make HTTP queries to AXIS API.
	_axisConnect = function(query) {
		var qParams
		  , qString
		  , url
		  , request
		  , emitter = new Emitter();

		if(_.isObject(query)) {                                                      // If query is prepared object, convert to query string.
			qParams = _.map(query, function(val, key) {
				return key + "=" + val;
			});

			qString = "?" + qParams.join('&');
		}

		var reqOptions = {
			hostname: ip
		  , path:     '/axis-cgi/com/ptz.cgi' + qString
		  , method:   'GET'
		  , headers:  {
		  	'Connection': 'keep-alive'
		  }
		}

		console.log(reqOptions);

		var callback = function(res) {
			request.hadResponse = true;
			res.hadResponse = true;

			res.on('end', function() {
				emitter.emit('end');
				request.end();
			});
			res.on('close', function() {
				emitter.emit('end');
				request.end();
			});
			res.on('data', function(data) {
				emitter.emit('data', data );
				request.end();
			});
			res.on('error', function(err) {
				logger.log('error', err.message);
				request.end();
			})
			res.socket.on('error', function(err) {
				logger.log("error", err.message);
				request.end();
			});
		};

		request = http.get(reqOptions, callback);                                    // Send HTTP request to AXIS camera HTTP API.

		request.on('error', function(err) {
			logger.log("error", err.message);                                        // Handle errors resulting from data > Content-Length.
			request.end();
		});

		return emitter;
	}

	// Parse returned string from AXIS API into JSON object.
	_axisParse = function(results) {
		if(_.isString(results)) {
			var resString = _.clone(results).toString()
			  , results   = {}
			  , arr       = _.compact(resString.split('\\s+'));

			if(arr.length !== 0) {
				_.each(arr, function(val) {
					var pair = val.split('=');
					if(pair.length === 2) {
						if(_.isNaN(parseInt(pair[1]))) {
							results[pair[0]] = pair[1];
						} else {
							results[pair[0]] = parseInt(pair[1]);
						}
					}
				});

				if(_.isEmpty(results) !== false) {
					return results;
				}
			}

		}

		return false;
	}

	/**
	 * Public AXIS functions.
	 */

	// Sync current position from AXIS API to database.
	axisSync = function() {
		var _this = this;

		try {
			_axisConnect({query: 'position'})
				.on('data', function(data) {
					var parsed = _axisParse(data);
					_this.update(parsed);                                             // Update db with parsed new values.
				})
				.on('error', function(err) {
					logger.log('error', err);
				});
		} catch (e) {
			return false;
		}

		return true;
	}

	// Request AXIS camera centering on user selected point.
	axisCenter = function(x, y) {
		var _this = this;
		if(x && y && _.isNumber(x) && _.isNumber(y)) {
			if(x >= 0 && x <= 100 && y >= 0 && y <= 100) {
				try {
					_axisConnect({
							center      : x+','+y
						  , imagewidth  : 100
						  , imageheight : 100
						})
						.on('end', axisSync)                                         // Save new positions to db when action complete.
						.on('error', function(err) {
							logger.log('error', err);
						});
				} catch(e) {
					return false;
				}
			
				return true;
			}
		}

		return false;
	}

	// Request AXIS camera move action to current selected location.
	axisMove = function(actions) {
		var changed, _this = this;

		if(_.isObject(actions) && _.isEmpty(actions) === false) {
			changed = this.getChanged(actions);
			_.each(changed, function(val, action) {
				var command = {
					imagewidth  : 100
				  , imageheight : 100
				};

				if((action === 'pan' || action === 'tilt') && (val > 180 || val < -180)) {
					throw new Error("Pan or tilt value falls outside allowed range");
				}

				command[action] = val;
		
				try {
					_axisConnect(command)
						.on('end', function() {
							delete command.imageheight;                                      // These are temporary calculatons that
							delete command.imagewidth;                                       // are not part of camera model.
		
							_this.update(command);                                           // Save new position locally.
						})
						.on('error', function(err) {
							logger.log('error', err);
						});
				} catch(e) {
					logger.log('error', err);
					return false;
				}
			});
			return true;
		}
		return false;
	}

	axisAutoFocus = function(value) {
		var bool = (value === 'true');
		if(_.isBoolean(bool)) {
			var qVal = bool ? "on" : "off";
			_axisConnect({autofocus: qVal});
			return true;
		}
		return false;
	}

	axisAutoIris = function(value) {
		var bool = (value === 'true');
		if(_.isBoolean(bool)) {
			var qVal = bool ? "on" : "off";
			_axisConnect({autoiris: qVal});
			return true;
		}
		return false;
	}

	return {
		autoFocus: axisAutoFocus
	  , autoIris:  axisAutoIris
	  , move:      axisMove
	  , center:    axisCenter
	  , sync:      axisSync
	  , poll: function() {
	  	axisSync();
	  	setInterval(axisSync, 10000);
	  }
	}
}