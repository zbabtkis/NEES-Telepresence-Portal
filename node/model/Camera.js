var Emitter = require('events').EventEmitter
  , http    = require('http')
  , db      = require('../config/db')
  , _       = require('underscore');

module.exports = function(model) {
	"use strict";

	var _attributes   // -
	  , _options      // -
	  , _defaults     // -
	  , _update       // -()
	  , _axisConnect  // -()
	  , _axisParse    // -()
	  , axisSync      // +()
	  , axisCenter    // +()
	  , axisMove      // +()
	  , fetch         // +()
	  , get           // +()
	  , save          // +()
	  , api           // +
	  , emitter       // +
	  , _this = this; // -

	// @TODO: Remove this and add IP to models in DB.
	model.ip = '192.168.1.10';
	emitter = new Emitter();

	/**
	 * Private model values.
	 */

	_options = {
		url: 'http://' + model.ip + '/axis-cgi/com/ptz.cgi'
	};

	_defaults = {
	    'pan'    : 60
	  , 'tilt'   : 60
	  , 'zoom'   : -10
	  , 'focus'  : 0
	  , 'iris'   : 0
	};

	_attributes = _.defaults(model, _defaults);

	/**
	 * Private functions based on AXIS HTTP address.
	 */

	_axisConnect = function(query) {
		var qParams
		  , qString
		  , url
		  , emitter = new Emitter();

		qString = "?" + JSON.stringify(query);

		if(_.isObject(query)) {
			qParams = _.map(query, function(val, key) {
				return key + "=" + val;
			});

			qString = "?" + qParams.join('&');
		}

		http.get(_options.url + qString, function(connection) {
			connection.on('data', function(data) {
				emitter.emit('data', data);
			});
			connection.on('end', function() {
				emitter.emit('end')
			});
		});

		return emitter;
	}

	_axisParse = function(results) {
		var resString = _.clone(results).toString()
		  , results   = {}
		  , arr       = _.compact(resString.split('\r\n'));

		_.each(arr, function(val) {
			var pairs = val.split('=');

			if(_.isNaN(parseInt(pairs[1]))) {
				results[pairs[0]] = pairs[1];
			} else {
				results[pairs[0]] = parseInt(pairs[1]);
			}
		});

		return results;
	}

	/**
	 * Public AXIS functions.
	 */

	axisSync = function() {
		_axisConnect({query: 'position'})
			.on('data', function(data) {
				_update(_axisParse(data));
			});
	}

	axisCenter = function(x, y) {
		_axisConnect({
				center      : x+','+y
			  , imagewidth  : 100
			  , imageheight : 100
			})
			.on('end', axisSync);
	}

	axisMove = function(actions) {
		_.each(actions, function(val, action) {
			var command = {
				imagewidth  : 100
			  , imageheight : 100
			};

			command[action] = val;

			_axisConnect(command)
				.on('end', function() {
					delete command.imageheight;
					delete command.imagewidth;

					_update(command);
				});
		});
	}

	/**
	 * Private local model functions.
	 */

	_update = function(changes) {
		var changed = [];

		_.each(changes, function(val, key) {
			if(_.isNumber(_attributes[key]) && _attributes[key] !== val) {
				_attributes[key] = parseInt(_.result(changes, key));
				changed.push(key);
			}
		});

		if(changed.length > 0) {
			save(changed);
		}
	}

	/**
	 * Public local model setter/getters.
	 */

	save = function(changed) {
		db.update("cameras", _.pick(_attributes, changed))
			.on('complete', function() {
				emitter.emit('change', _attributes);
				_.each(changed, function(change) {
					emitter.emit('change:' + change, _.pick(_attributes, change));
				});
			});
	}

	get = function(attr) {
		return attr ? _attributes[attr] : _attributes;
	}

	fetch = function() {
		db.get("cameras", get('id'))
			.on('data', function(data) {
				console.log(data);
				_update(data);
			});
	}();

	/**
	 * Public API for extended to application.
	 */

	api = {
		sync    : axisSync
	  , center  : axisCenter
	  , move    : axisMove
	  , get     : get
	  , fetch   : fetch
	  , toJSON  : get
	  , poll    : function() {
	  	axisSync();
	  	setInterval(axisSync, 5000);
	  }
	}

	return _.extend(emitter, api);
};