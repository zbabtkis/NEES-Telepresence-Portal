require.config({
	paths: {
		'backbone': 'components/backbone/backbone',
		'backbone.kendowidget': 'vendor/Backbone/backbone.kendowidget',
		'underscore': 'components/underscore/underscore',
		'domReady': 'components/requirejs-domready/domReady',
		'spin': 'components/spin.js/spin',
		'text': 'components/requirejs-text/text',
		'jquery': 'components/jquery/jquery',
		'modernizr': 'components/modernizr/modernizr',
		'socketio': 'http://sticky.eri.ucsb.edu:8888/socket.io/socket.io',
		'kendo': 'components/kendo/js/kendo.web.min'
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
		'kendo': ['jquery']
	}
});

window.Telepresence = {
	defaults: {
		theme: 'theme-light'
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
		}
	},
	nodeServer: "http://sticky.eri.ucsb.edu:8888/streams/",
	version: "2.0.1",
	switchTheme: function(theme) {
		var body = document.getElementsByTagName('body')[0];
		body.className = theme || this.defaults.theme;

		return body;
	}
}

require([
	  'Router/Router'
	, 'View/VideoControls'
	, 'View/CameraControls'
	, 'View/Tabs'
	, 'socketio'], 

	function(Router, VideoControls, CameraControls, Tabs, io) {
		var App = function() {
			var _this = this;

			function initialize() {
				Telepresence.switchTheme();
				// Check if Node.js server is active to determine
				// Backbone saivng mechanism.
				jQuery.ajax({
					url: 'http://snow-dev.eri.ucsb.edu:8888/',
					dataType: 'json',
					cache: false,
					success: function() {
						if(typeof io !== 'undefined') {
							Telepresence.socket = io.connect('http://sticky.eri.ucsb.edu:8888');
							_bootstrap();
						} else {
							alert("Oops, the telepresence app doesn't seem to be working right now. Sorry...");
						}
					},
					fail: function() {
						alert("Oops, the telepresence app doesn't seem to be working right now. Sorry...");
					}
				});

				return Telepresence;
			};

			function _bootstrap() {
				// Iniitalize major components.
				Router.initialize();

				// Views
				CameraControls.initialize();
				VideoControls.initialize();
				Tabs.initialize();
			};

			return {
				initialize: initialize
			};
		}

		var app = new App().initialize();
	}
);