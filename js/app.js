require.config({
	paths: {
		'backbone': 'vendor/Backbone/backbone',
		'underscore': 'vendor/Underscore/underscore',
		'domReady': 'vendor/Require/domReady',
		'spin': 'vendor/Spin/spin',
		'text': 'vendor/Require/text'
	},
	waitSeconds: 2
});

require([
	  'Router/Router'
	, 'View/Sites'
  	, 'View/Stream'
	, 'View/Tabs'
	, 'View/VideoControls'
	, 'View/CameraControls'
	, 'Model/Feed'
	, 'underscore'
	, 'backbone'], 

	function(Router, Sites, Stream, Tabs, VideoControls, CameraControls, Feed) {
		// Iniitalize major components.
		Router.initialize();
		Sites.initialize();
		Feed.initialize();
		VideoControls.initialize();
		CameraControls.initialize();
		Tabs.initialize();

		Backbone.history.start();
	}
);