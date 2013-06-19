require.config({
	paths: {
		'backbone': 'vendor/Backbone/backbone',
		'backbone.kendowidget': 'vendor/Backbone/backbone.kendowidget',
		'underscore': 'vendor/Underscore/underscore',
		'domReady': 'vendor/Require/domReady',
		'spin': 'vendor/Spin/spin',
		'text': 'vendor/Require/text'
	},
	waitSeconds: 2
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
	nodeActive: false,
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
	, 'underscore'
	, 'backbone'], 

	function(Router, VideoControls, CameraControls, Tabs) {
		var App = function() {
			var _this = this;

			this.initialize = function() {
				Telepresence.switchTheme();
				// Check if Node.js server is active to determine
				// Backbone saivng mechanism.
				jQuery.ajax({
					url: 'http://snow-dev.eri.ucsb.edu:8888/',
					dataType: 'json',
					cache: false,
					success: function() {
						Telepresence.nodeActive = true;
					},
					error: function() {
						Telepresence.nodeActive = false;
					},
					fail: function() {
						Telepresence.nodeActive = false;
					},
					complete: function() {
						_this._bootstrap();
					}
				});

				if(typeof io !== 'undefined') {
					Telepresence.socket = io.connect('http://sticky.eri.ucsb.edu:8888');
				} else {
					Telepresence.nodeActive = false;
				}

				return Telepresence;
			};

			this._bootstrap = function() {
				// Iniitalize major components.
				Router.initialize();

				// Views
				CameraControls.initialize();
				VideoControls.initialize();
				Tabs.initialize();
			};

			return {
				initialize: _this.initialize
			};
		}

		var app = new App().initialize();
	}
);