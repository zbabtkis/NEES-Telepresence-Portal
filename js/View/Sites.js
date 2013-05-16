define([
	  'text!Templates/Sites.jtpl'
	, 'Collection/Sites'
	, 'underscore'
	, 'backbone'
	, 'domReady'], 

	function(tpl, collection) {
	'use strict';

	var $ = jQuery,
		Sites, sites;

	Sites = Backbone.View.extend({
		tagName: 'section',
		id: 'sites',
		template: _.template(tpl),
		initialize: function() {
			this.$parent = $('#telepresence-dashboard');
			_.bindAll(this);
		},
		render: function() {
			var models = collection.toJSON(),
				html;

			html = this.template({sites: models});

			this.$el.html(html);
			this.$parent.html(this.$el);

			// Re-bind events after view has rendered
			this.delegateEvents();

			return this;
		},
		events: {
			'click .site': 'listCameras'
		},
		listCameras: function(e) {
			var $camera = $(e.target),
				Router = require('Router/Router');

			Router.navigate('/sites/' + $camera.data('location'), {trigger: true});
		}
	});

	return {
		initialize: function() {
			sites = new Sites();
		},
		render: function() {
			sites.render();
		}
	};
});