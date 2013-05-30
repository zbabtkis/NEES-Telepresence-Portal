define([
	  'View/MenuHeader'
	, 'underscore'
	, 'backbone'
	, 'domReady'], 

	function(MenuHeader) {
	'use strict'

	var Tabs, tabs,
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

	tabs = new Tabs();

	return tabs;
});