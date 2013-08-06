var prompt = require('prompt'),
	exec   = require('child_process').exec;

module.exports = function(grunt) {

	grunt.initConfig({
		requirejs: {
			compile: {
				options: {
					name: 'app',
					baseUrl: './public/src',
					out: './public/build/build.js',
					findNestedDependencies: true,
					optimize: 'closure',
					paths: {
						'backbone': '../bower_components/backbone/backbone',
						'backbone.kendowidget': '../bower_components/backbone.kendoWidget/backbone.kendowidget',
						'underscore': '../bower_components/underscore/underscore',
						'domReady': '../bower_components/requirejs-domready/domReady',
						'spin': '../bower_components/spin.js/spin',
						'text': '../bower_components/requirejs-text/text',
						'jquery': '../bower_components/jquery/jquery',
						'modernizr': '../bower_components/modernizr/modernizr',
						'socketio': 'http://mendo.nees.ucsb.edu:8888/socket.io/socket.io',
						'kendo': '../bower_components/kendo-ui/js/kendo.web.min',
						'datejs': '../bower_components/datejs/build/date',
						'bookmarkr': 'Admin/bookmarkr',
						'AdminControls': 'Admin/ControlAdmin',
						'toggle': '../bower_components/Bani/dist/bani-views.min'
					},
					shim: {
						'backbone': {
							deps: ['underscore', 'jquery'],
							exports: 'Backbone'
						},
						'underscore': {
							exports: "_"
						},
						'jquery': {
							exports: "$"
						},
						'socketio': {
							exports: 'io'
						},
						'spin': ['jquery'],
						'kendo': {
							deps: ['jquery'],
							exports: 'kendo'
						},
						'toggle': {
							deps: ['jquery', 'backbone', 'underscore'],
							exports: 'ToggleSwitch'
						},
						'backbone.kendowidget': {
							deps: ['jquery', 'backbone', 'underscore'],
							exports: 'Backbone.kendoWidget'
						}
					}
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');


	grunt.registerTask('installBowerDeps', "install npm and bower dependencies", function() {
		var cb = this.async();
		exec('bower install', {cwd: './public'}, function(err, stdout, stderr) {
			grunt.log.ok(stdout);
			cb();
		});
	});

	grunt.registerTask('installNodeDeps', "install npm and bower dependencies", function() {
		var done = this.async();
		exec('npm install', {cwd: './node'}, function(err, result, code) {
			if(err) {
				grunt.fail.warn(err);
			} else {
				grunt.log.ok('NPM dependencies installed');
			}
			done();
		});
	});

	grunt.registerTask('linkDB', "create db.json for telepresence backend", function() {
		var done = this.async();

		prompt.start();
		prompt.get({
				properties: {
					dbname: {
						type: 'string',
						description: 'Drupal database name',
						message: 'Database name must be string',
						required: true
					},
					user: {
						type: 'string',
						description: 'Drupal database user',
						message: 'Database user name must be string',
						required: true
					},
					password: {
						type: 'string',
						description: 'Drupal database password',
						message: 'Database password must be string',
						required: true
					}
				}
			}, function(err, result){
			var db = {
				host: 'localhost',
				database: result.dbname,
				user: result.user,
				password: result.password
			};
			grunt.log.ok('Built DB structure');
			grunt.file.write('./node/config/db.json', JSON.stringify(db), function(err) {
				if(err) {
					grunt.fail.warn('DB file could not be written.');
				} else {
					grunt.log.ok('DB file written')
					done();
				}
			});
		});
	});

	grunt.registerTask('start', "Run node app", function() {
		var done = this.async();

		exec('node app', {cwd: './node'}, function(err) {
			if(err) {
				grunt.fail.warn("Could not start node server");
			}
			grunt.log.ok('Grunt server running');
			done();
		});
	});

	grunt.registerTask('runForever', 'Run node app in forever mode', function() {
		var done = this.async();

		exec('forever app.js', {cwd: './node'}, function(err) {
			if(err) {
				grunt.fail.warn("Could not start node server")
			}
			grunt.log.ok('Grunt server running');
			done();
		});
	});

	grunt.registerTask('install', ['installNodeDeps', 'installBowerDeps', 'linkDB']);
	grunt.registerTask('build', ['requirejs']);

	grunt.registerTask('setEnv', 'Set up environment for development', function() {
		var done = this.async();

		prompt.start();
		prompt.get(['environment'], function(err, results) {
			var file = './drupal/telepresence.tpl.php'
		  	  , template = grunt.file.read(file)
		  	  , changed, options;

		  	options = {
		  		dev: '/public/src/app',
		  		live: '/public/build/app'
		  	};

		  	if(options.hasOwnProperty(results.environment)) {
		  		if(results.environment === 'live') {
		  			grunt.task.run('build');
		  		}
		  		changed = template.replace(/\/\*\* GRUNT:APP_PATH \*\/ (.*?) \/\*\*/, "/** GRUNT:APP_PATH */ '" + options[results.environment] + "' /**");
		  		grunt.file.write(file, changed);
		  		grunt.log.ok("Environment has been updated to: " + results.environment);
		  		done();
		  	} else {
		  		grunt.fail.warn("You have specified an incorrect environment variable. Please use either dev or live.");
		  		done();
		  	}
		});
	});
}