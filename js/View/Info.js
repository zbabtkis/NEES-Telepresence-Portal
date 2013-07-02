define([
	  'underscore'
	, 'backbone'
	, 'domReady'], 

	function() {
	'use strict'

	var InfoView, info,
		$ = jQuery;

	InfoView = Backbone.View.extend({
		tagName: 'article',
		id: 'info-view',
		initialize: function() {
			_.bindAll(this);
		},
		render: function() {
			var $parent = $('#telepresence-dashboard'),
				txt = Drupal.settings.telepresence_about;

			$parent.html(this.$el.html(txt));

			this.$el.before('<h3 class="header-inner">Help</h3>');
		}
	});

	info = new InfoView()

	return info;
});