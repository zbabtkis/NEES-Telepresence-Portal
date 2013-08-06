({
	name: 'app',
	baseUrl: '.',
	out: '../build/app.js',
	findNestedDependencies: true,
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
})