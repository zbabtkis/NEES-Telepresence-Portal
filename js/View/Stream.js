define([
	  'Model/Feed'
	, 'spin'
	, 'backbone'
	, 'underscore'
	, 'domReady'],	

	function(feed, Spinner) {
	'use strict';

	var $ = jQuery,
		Stream, stream;

	Stream = Backbone.View.extend({
		el: '#stream',
		initialize: function() {
			_.bindAll(this);
			
			// Awesome spinny preloader provided by spin.js :).
			this.spinner = new Spinner({
				color:'#eee'
			});
			
			this.$el.append("<h1 class='telepresence-message'>Select a stream</h1>");

			this.on('fullScreen', this.fullScreen);
		},
		media: new Image(),
		load: function(id) {
			var Cameras = require('Collection/Cameras'),
				Cam     = Cameras.get(id),
				that    = this;

			Cam.on('change:media', function() {
				var media = this.get('media');

				that.render(media);
			});

			Cam.loadMedia();
		},
		render: function(feed) {
			$(this.media).attr('src', feed);

			$(this.media).load(this.loadSuccess);
			$(this.media).error(this.loadFail);

			// Display spinner while image loads.
			this.spinner.spin(this.el);
		},
		fullScreen: function() {
			// Create translucent background over app during full screen mode.
			$('.transparentBox').toggle();
			// Display player controls at bottom of screen
			$('#player-controls').toggleClass('fullScreenControls');
			// Make stream take up full window.
			$(this.media).toggleClass('fullScreen');

			// Otherwise, app wrapper elongates to match bottom of image.
			this.resize();
		},
		loadFail: function(e) {
			this.spinner.stop();
			this.trigger('loadFail');
			this.$el.html("<h1 class='telepresence-message'>Unable to load stream</h1>");
		},
		loadSuccess: function() {
			this.spinner.stop();
			this.trigger('loadSuccess');
			this.$el.addClass('stream-loaded');
			// Append new stream image to view.
			this.$el.html($(this.media));
			// Resize wrapper to match image size.
			this.resize();
		},
		resize: function() {
			var height = $(this.media).height();

			if(height) {
				this.$el.height(height);
			}
		}
	});

	stream = new Stream();

	return stream;
});