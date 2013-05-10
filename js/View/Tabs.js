define(['underscore'
	, 'backbone'
	, 'domReady'], 

	function($) {
	'use strict'

	var Tabs, tabs;

	Tabs = Backbone.View.extend({
		el: '#tps-tabs',
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
		},
		showList: function() {
			$('#info-view').slideUp('fast', function() {
				$('#info-view').hide();
				app.View.MenuHeader.trigger('changeMenu','Site Cameras');
				$('#nav').slideDown();
			});
		},
		showHelp: function() {
			$('#nav').slideUp('fast', function() {
				$('#nav').hide();
				app.View.MenuHeader.trigger('changeMenu', 'Help');
				$('#info-view').slideDown();
			});
		},
		toggleMenu: function() {
			$('#telepresence-dashboard').toggle('slide', {direction: 'up'}, 200);
		}
	});

	var initialize = function() {
		tabs = new Tabs();
	}

	return {
		initialize: initialize
	}
}(jQuery));