var mysql   = require('mysql')
  , Emitter = require('events').EventEmitter
  , fs      = require('fs')
  , _       = require('underscore');

var db = (function() {
	var dbConfig
	  , connection;

	var dbConfig = JSON.parse(fs.readFileSync(__dirname + '/db.json'));

	console.log(dbConfig);
	
	connection = mysql.createConnection(dbConfig);

	connection.connect();

	return connection;
}());

exports.add = function(table, model) {
	var emitter = new Emitter();
	db.query("INSERT INTO " + _.unescape(table)/ + " SET ?", model, function(err) {
		if(err) {
			emitter.emit('error', err);
		} else {
			emitter.emit('complete');
		}
	});

	return emitter;
}

exports.update = function(table, model) {
	var emitter = new Emitter();
	db.query("UPDATE " + _.unescape(table) + " SET ? WHERE id = ?", [model, model.id], function(err) {
		if(err) {
			emitter.emit('error', err);
		} else {
			emitter.emit('complete');
		}
	});

	return emitter;
}

exports.get = function(table, id) {
	var emitter = new Emitter();
	if(id) {
		db.query("SELECT * FROM " + _.unescape(table) + " WHERE id = ?", [id], function(err, result) {
			if(err) {
				emitter.emit('error', err);
			} else {
				emitter.emit('data', result);
			}
		});
	} else {
		db.query("SELECT * FROM " + _.unescape(table), function(err, results) {
			if(err) {
				emitter.emit('error', err);
			} else {
				emitter.emit('data', results);
			}
		});
	}

	return emitter;
}