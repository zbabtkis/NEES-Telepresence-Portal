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
			var html;

			html = that.template({sites: collection});

			this.$el.html(html);
			this.$parent.html(this.$el);

			return this;
		}
	});

	sites = new Sites();

	return sites;
});