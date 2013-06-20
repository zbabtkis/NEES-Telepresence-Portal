define([
	  'text!Templates/Sites.jtpl'
	, 'underscore'
	, 'jquery'
	, 'backbone'
	, 'domReady'], 

	function(Template, _, $, Backbone) {
	'use strict';

	var List, list;

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
			var collection = this.collection.group().toJSON(),
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

	return List;
});