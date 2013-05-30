define([
	  'text!Templates/Sites.jtpl'
	, 'Collection/Cameras'
	, 'underscore'
	, 'backbone'
	, 'domReady'], 

	function(Template, Cameras) {
	'use strict';

	var $ = jQuery,
		List, list;

	List = Backbone.View.extend({
		events: {
			'click .site': 'listCameras',
			'click .camera': 'goToFeed'
		},
		tagName: 'section',
		id: 'sites',
		template: _.template(Template),
		initialize: function() {
			this.$parent = $('#telepresence-dashboard');
			_.bindAll(this);
		},
		render: function() {
			var collection = Cameras.group().toJSON(),
				html;

			html = this.template({sites: collection});

			this.$el.html(html);
			this.$parent.html(this.$el);

			// Re-bind events after view has rendered
			this.delegateEvents();

			return this;
		},
		listCameras: function(e) {
			var $site = $(e.target),
				assoc = $site.data('assoc-list'),
				$cameras = $('.cameras[data-assoc-list=' + assoc + ']');

			$('.active').removeClass('active');

			$cameras.addClass('active');
			$site.addClass('active');
		},
		goToFeed: function(e) {
			this.trigger('cameraSelected', $(e.target).data('id'));
		}
	});

	var list = new List

	return list;
});