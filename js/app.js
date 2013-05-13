define([
	  'underscore'
	, 'backbone'], 

	function(){
		var initialize = function() {
		    require([
		    	  'Router/Router'
		    	, 'View/Tabs'], 

		    	function(Router, Tabs, Sites) {
		      Tabs.initialize();
		      Backbone.history.start();
		    });
		};

		return {
		  initialize: initialize
		};
});