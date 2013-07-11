require.config({
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
		'bookmarkr': 'Admin/bookmarkr'
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
		}
	},
	waitSeconds: 0
});

window.Telepresence = {
	defaults: {
		theme: 'theme-extra-light'
	},
	DEBUG: true,
	debug: function(first) {
		if(this.DEBUG) {
			var at = new Error().stack.split("\n")[2];

			if(_.isObject(arguments) && arguments.length === 1) {
				console.log("Telepresence DEBUG: ", first, at)
			} else {
				arguments[arguments.length-1] + at;
				console.log.apply(console, arguments);
			}
			require.config.urlArgs = "v=" +  (new Date()).getTime();
		}
	},
	nodeServer: "http://mendo.nees.ucsb.edu:8888/",
	version: "2.0.1",
	switchTheme: function(theme) {
		var body = document.getElementsByTagName('body')[0];
		body.className = body.className + ' ' + (theme || this.defaults.theme);

		return body;
	},
	API: {
		getPosition: function() {
			alert("You haven't selected a camera and position yet.");

			return undefined;
		}
	}
}

define(['jquery', 'spin', 'domReady'], function($, Spinner) {
		var App = function() {
			var _this = this;

			var spinner = new Spinner({
				color: '#555'
			}).spin(document.getElementById('telepresence-wrap'));

			function bootstrap() {
				Telepresence.switchTheme();
				// Check if Node.js server is active to determine
				// Backbone saivng mechanism.
				
				require(['socketio'], function(io) {
					var sock = Telepresence.socket = io.connect('http://mendo.nees.ucsb.edu:8888');
					sock.on('connect', initialize);
				});

				return Telepresence;
			};

			function initialize() {
				require([
					  'Router/Router'
					, 'View/VideoControls'
					, 'View/CameraControls'
					, 'View/Tabs'], 

				function(Router, VideoControls, CameraControls, Tabs) {
				    // Iniitalize major components.
					Router.initialize();

					// Views
					CameraControls.initialize();
					VideoControls.initialize();
					Tabs.initialize();

					spinner.stop();
					delete spinner;
					$('.app-content').animate({opacity: 1});
				});
			};

			return {
				bootstrap: bootstrap
			};
		}

		var app = new App().bootstrap();
	}
);
