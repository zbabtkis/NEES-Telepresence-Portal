var http    = require('http')
  , db      = require('../config/db')
  , Emitter = require('events').EventEmitter
  , _       = require('underscore')
  , Camera  = require('../model/Camera');

module.exports = (function() {
	var _models // -
	  , _upadte // -()
	  , _addOne // -()
	  , sync    // +()
	  , get     // +()
	  , all     // +()
	  , toJSON  // +()
	  , emitter // +
	  , api     // +;

	_models = {};

	emitter = new Emitter();

	/**
	 * Collection private functions
	 */

	_addOne = function(data) {
		var model;

		if(data instanceof Camera) {
			model = _models[data.get('id')] = data;
		} else {
			model = _models[data.id] = new Camera(data);
		}

		model.on('change', function(m) {
			emitter.emit('change', m);
			emitter.emit('change:' + m.id, m);
		});

		emitter.emit('add', model);
	};

	_update = function(data) {
		var original = _.size(_models)
		  , added    = 0;

		_.each(data, function(model) {
			if(get(model.id)) {
				return;
			} else {
				_addOne(model);
				added++;
			}
		});

		if(added > 0 && original === 0) {
			emitter.emit('reset', _models);
		}
	}

	/**
	 * Collection public functions.
	 */

	sync = function() {
		db.get('cameras')
			.on('data', _update);
	};

	get = function(id) {
		console.log('id: ' + id);
		return id ? _models[id] : _models;
	};

	toJSON = function() {
		return _.map(_models, function(model) {
			return model.toJSON();
		});
	}

	/**
	 * Public API accessible from application.
	 */

	api = {
		sync   : sync
	  , get    : get
	  , toJSON : toJSON
	  , poll   : function() {
	  	_.each(_models, function(model) {
	  		model.poll();
	  	});
	  }
	}

	return _.extend(emitter, api);
}());