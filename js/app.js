require.config({
	paths: {
		'backbone': '../components/backbone/backbone',
		'backbone.kendowidget': '../components/backbone.kendoWidget/backbone.kendowidget',
		'underscore': '../components/underscore/underscore',
		'domReady': '../components/requirejs-domready/domReady',
		'spin': '../components/spin.js/spin',
		'text': '../components/requirejs-text/text',
		'jquery': '../components/jquery/jquery',
		'modernizr': '../components/modernizr/modernizr',
		'socketio': 'http://sticky.eri.ucsb.edu:8888/socket.io/socket.io',
		'kendo': '../components/kendo/js/kendo.web.min',
		'datejs': '../components/datejs/build/date',
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
	}
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
	nodeServer: "http://sticky.eri.ucsb.edu:8888/",
	version: "2.0.1",
	switchTheme: function(theme) {
		var body = document.getElementsByTagName('body')[0];
		body.className = theme || this.defaults.theme;

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
				$.ajax({
					url: Telepresence.nodeServer,
					dataType: 'json',
					cache: false,
					success: function() {
						require(['socketio'], function() {
							var sock = Telepresence.socket = io.connect('http://sticky.eri.ucsb.edu:8888');
							sock.on('connect', initialize);
						});
					},
					error: function() {
						alert("Oops, the telepresence app doesn't seem to be working right now. Sorry...");
					}
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