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
	DEBUG: true,
	debug: function(first) {
		if(this.DEBUG) {
			if(typeof args !== 'Object') {
				console.log("Telepresence DEBUG: ", first)
			} else {
				console.log.apply(console, arguments);
			}
		}
	},
	version: "2.0.1"
}

require([
	  'Router/Router'
	, 'Controller/Controller'
	, 'Controller/VideoController'
	, 'underscore'
	, 'backbone'], 

	function(Router, Controller, VideoController) {
		jQuery('#telepresence-wrap').draggable();
		// Iniitalize major components.
		Router.initialize();
		Controller.initialize();
		VideoController.initialize();
	}
);