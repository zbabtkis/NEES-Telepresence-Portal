require.config({
	paths: {
		'backbone': 'libs/backbone',
		'underscore': 'libs/underscore',
		'domReady': 'libs/domReady'
	}
});

//the "main" function to bootstrap your code
require(['app'], function (App) {   // or, you could use these deps in a separate module using define
  App.initialize();

});