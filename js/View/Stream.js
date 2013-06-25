define([
	  'text!Templates/Stream.jtpl'
	, 'Collection/Cameras'
	, 'spin'
	, 'backbone'
	, 'underscore'
	, 'jquery'
	, 'domReady'],	

	function(Template, Cameras, Spinner, Backbone, _, $) {
	'use strict';

	var Stream;

	Stream = Backbone.View.extend({
		el: '#stream',
		events: {
			'click .reload': 'reload'
		},
		initialize: function() {
			_.bindAll(this);
			
			// Awesome spinny preloader provided by spin.js :).
			this.spinner = new Spinner({
				color:'#eee'
			});

			this.model.on({
				'change:media': this.render,
				'change:isOn': this.promptReload
			});
		},
		template: _.template(Template),
		render: function(model) {
			var html  = this.template({camera: model.toJSON()});

			this.$el.html(html);
			this.spinner.spin(this.el);

			this.$('.stream-image').on({
				load: this.load,
				error: this.error
			});
		},
		load: function() {
			this.spinner.stop();
			this.model.set('isOn', true);
			this.trigger('loadSuccess');
		},
		error: function() {
			this.spinner.stop();
			this.model.set('isOn', false);
			this.trigger('loadFail');
			this.$el.html("<h1 class='telepresence-message'>Unable to load stream</h1>");
		},
		promptReload: function(model, isOn) {
			if(isOn === false) {
				this.$el.addClass('stream-ended');
				this.$el.prepend("<img class='reload' src='http://openclipart.org/image/800px/svg_to_png/171074/reload-icon.png' />");
			}
			this.delegateEvents();
		},
		reload: function() {
			this.$el.removeClass('stream-ended');
			this.model.loadMedia();
			this.delegateEvents();
		}
	});

	return Stream;
});