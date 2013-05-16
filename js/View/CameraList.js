define([
	  'text!Templates/Cameras.jtpl'
	, 'Collection/Cameras'
	, 'Router/Router'
	, 'underscore'
	, 'backbone'], 

	function(tpl, collection) {
		var $ = jQuery,
			Cameras, cameras;

		Cameras = Backbone.View.extend({
			tagName: 'ul',
			id: 'sub-menu',
			initialize: function() {
				this.listenTo(collection, 'reset', this.render);
				_.bindAll(this);
			},
			update: function(s) {
				collection.updateList(s);
			},
			template: _.template(tpl),
			render: function(c) {
				var models = collection.toJSON(),
					html, $parent, site;

				html = this.template({cams: models});

				site = Backbone.history.fragment.split('/')[1];
				$parent = $('#site-' + site);

				this.$el.html(html);

				$parent.after(this.$el);

				this.delegateEvents();

				return this;
			},
			events: {
				'click .camera': 'openFeed'
			},
			openFeed: function(e) {
				var $camera = $(e.target),
					Router = require('Router/Router'),
					site;

				site = Backbone.history.fragment.split('/')[1]

				Router.navigate('sites/' + site + '/' + $camera.data('camera') , {trigger: true});
			}
		});

		cameras = new Cameras();

		return cameras;
	}
);