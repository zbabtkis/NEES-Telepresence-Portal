define([
	  'Router/Router'
	, 'View/MenuHeader'
	, 'underscore'
	, 'backbone'
	, 'domReady'], 

	function(Router, MenuHeader) {
	'use strict'

	var Tabs,
		$ = jQuery;

	Tabs = Backbone.View.extend({
		el: '#tp-tabs',
		events: {
			'click #list-tab':'getList',
			'click #help-tab':'getHelp'
		},
		initialize: function() {
			this.on('toggleMenu', this.toggleMenu);
		},
		getList: function() {
			require(['Router/Router'], function(Router) {
				Router.navigate('sites', {trigger: true});
			});
		},
		getHelp: function() {
			require(['Router/Router'], function(Router) {
				Router.navigate('help', {trigger: true});
			});
		}
	});

	return {
		initialize: function() {
			var tabs = new Tabs();
		}
	};
});