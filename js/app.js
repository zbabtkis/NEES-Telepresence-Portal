require.config({
	paths: {
		'backbone': 'vendor/Backbone/backbone',
		'backbone.poller': 'vendor/Backbone/backbone.poller',
		'underscore': 'vendor/Underscore/underscore',
		'domReady': 'vendor/Require/domReady',
		'spin': 'vendor/Spin/spin',
		'text': 'vendor/Require/text'
	},
	waitSeconds: 2
});

window.Telepresence = {
	DEBUG: true,
	debug: function(args) {
		if(this.DEBUG) {
			console.log(args);
		}
	},
	version: "2.0.1"
}

require([
	  'Router/Router'
	, 'Controller/Controller'
	, 'underscore'
	, 'backbone'], 

	function(Router, Controller) {
		// Iniitalize major components.
		Router.initialize();
		Controller.initialize();
	}
);