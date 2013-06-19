define([
	  'text!Templates/Stream.jtpl'
	, 'Controller/Controller'
	, 'spin'
	, 'backbone'
	, 'underscore'
	, 'domReady'],	

	function(Template, Controller, Spinner) {
	'use strict';

	var $ = jQuery,
		Stream, stream;

	Stream = Backbone.View.extend({
		el: '#stream',
		events: {
			'click img': 'publishClick',
			'load img': 'loadSuccess',
			'fail img': 'loadFail',
			'click .reload': 'reloadFeed'
		},
		initialize: function() {
			_.bindAll(this);
			
			// Awesome spinny preloader provided by spin.js :).
			this.spinner = new Spinner({
				color:'#eee'
			});
			
			this.$el.append("<h1 class='telepresence-message'>Select a stream</h1>");

			this.on('fullScreen', this.fullScreen);
		},
		template: _.template(Template),
		load: function(id) {

			var Cam     = Cameras._byId[id],
				that    = this;

			Cam.on('change:media', function() {
				var media = this.get('media');

				that.render(media);
			});

			Cam.loadMedia();
		},
		render: function(feed) {
			var html = this.template({stream: feed});

			this.$el.html(html);

			this.$el.find('img').load(this.loadSuccess);
			this.$el.find('img').error(this.loadFail);

			// Display spinner while image loads.
			this.spinner.spin(this.el);
		},
		fullScreen: function() {
			// Create translucent background over app during full screen mode.
			$('.transparentBox').toggle();
			// Display player controls at bottom of screen
			$('#player-controls').toggleClass('fullScreenControls');
			// Make stream take up full window.
			this.$el.toggleClass('fullScreen');

			// Otherwise, app wrapper elongates to match bottom of image.
			this.resize();
		},
		loadFail: function(e) {
			Telepresence.debug('Image Load Failed');

			this.spinner.stop();
			this.trigger('loadFail');
			this.$el.html("<h1 class='telepresence-message'>Unable to load stream</h1>");
		},
		loadSuccess: function() {
			Telepresence.debug('Image Load Success');

			this.spinner.stop();
			this.trigger('loadSuccess');
		},
		resize: function() {
			var height = $(this.media).height();

			if(height) {
				this.$el.height(height);
			}
		},
		publishClick: function(e) {
			this.trigger('streamClicked', e);
		},
		promptReload: function() {
			this.$el.addClass('stream-ended');
			this.$el.prepend("<img class='reload' src='http://openclipart.org/image/800px/svg_to_png/171074/reload-icon.png' />");
		},
		reloadFeed: function() {
			console.log("About to load feed");
		}
	});

	stream = new Stream();

	return stream;
});