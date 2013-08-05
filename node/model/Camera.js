var Emitter = require('events').EventEmitter
  , db      = require('../config/db')
  , AXIS    = require('./Axis')
  , _       = require('underscore')
  , Winston = require('winston');

var logger = new (Winston.Logger)({
	transports: [
		new (Winston.transports.File)({ filename: 'Camera.log' })
	]
});

var Model = module.exports = function(model) {
	"use strict";

	var _attributes   // -
	  , _notifyChange // -()
	  , _AXIS         // +()
	  , update        // +()
	  , getChanged    // +()
	  , fetch         // +()
	  , get           // +()
	  , save          // +()
	  , api           // +
	  , emitter       // +
	  , _this = this; // -

	/**
	 * Private model values.
	 */

	_attributes = _.defaults(model, {
	    'pan'    : 60
	  , 'tilt'   : 60
	  , 'zoom'   : -10
	  , 'focus'  : 0
	  , 'iris'   : 0
	});

	/**
	 * Private local model functions.
	 */

	_notifyChange = function(changed) {
		api.emit('change', _attributes);
		_.each(changed, function(change) {
			var value = _.pick(_attributes, change);
			api.emit('change:' + change, value);
		});

		return true;
	}

	// Compare current camera values with new values.
	getChanged = function(changes) {
		var changed = [];

		if(_.isEmpty(changes) === false) {
			_.each(changes, function(val, key) {
				if(_.isNumber(_attributes[key]) && _attributes[key] !== val) {
					_attributes[key] = parseInt(_.result(changes, key));                 // Save changes to node buffer.
					changed.push(key);                                                   // Add key to changed so new values can be returned.
				}
			});

			return _.pick(_attributes, changed);
		}

		return false;
	}

	// Update attributes with new values and sync to database.
	update = function(changes) {
		if(_.isEmpty(changes) === false) {
			delete changes.camera;
			save(changes);

			return true;
		}

		return false;
	}

	/**
	 * Public local model setter/getters.
	 */

	save = function(changed) {
		console.log('saving', changed);
		try {
			db.update("cameras", changed)
				.on('complete', function() {
					_notifyChange(changed);
				})
				.on('error', function(error) {
					logger.log(error);
				});
		} catch (e) {
			return false;
		}

		return true;
	}

	get = function(attr) {
		return attr ? _attributes[attr] : _attributes;
	}

	_AXIS = new AXIS(get('ip'));

	/**
	 * @interface.
	 */

	api = _.extend(new Emitter(), {
		sync      : _AXIS.sync
	  , center    : _AXIS.center
	  , move      : _AXIS.move
	  , autofocus : _AXIS.autoFocus
	  , autoiris  : _AXIS.autoIris
	  , poll      : _AXIS.poll
	  , update    : update
	  , get       : get
	  , getChanged: getChanged
	  , toJSON    : get
	});

	_.bindAll(api, 
		'sync'
	  , 'center'
	  , 'move'
	  , 'autofocus'
	  , 'autoiris');

	return api;
};