({
	baseUrl: "./js",
	dir: "./js/dist",
	name: "app",
	findNestedDependencies: true,
	paths: {
		'backbone': '../components/backbone/backbone',
		'backbone.kendowidget': '../components/backbone.kendoWidget/backbone.kendowidget',
		'underscore': '../components/underscore/underscore',
		'domReady': '../components/requirejs-domready/domReady',
		'spin': '../components/spin.js/spin',
		'text': '../components/requirejs-text/text',
		'jquery': '../components/jquery/jquery',
		'modernizr': '../components/modernizr/modernizr',
		'socketio': 'empty:',
		'kendo': '../components/kendo-ui/js/kendo.web.min',
		'datejs': '../components/datejs/build/date',
		'bookmarkr': 'Admin/bookmarkr'
	}
})
