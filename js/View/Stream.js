define([
	  'View/FeedImage'
	, 'View/VideoControls'
	, 'Model/Feed'
	, 'spin'
	, 'backbone'
	, 'underscore'
	, 'domReady'],	

	function(image, controls, feed, Spinner) {
	'use strict';

	var $ = jQuery,
		Stream, stream;

	Stream = Backbone.View.extend({
		el: '#stream',
		initialize: function() {
			_.bindAll(this);
			
			this.addFancyElements();
			
			this.$el.append("<h1 class='telepresence-message'>Select a stream</h1>");
		},
		$media: $('<img />'),
		render: function(feed) {
			var that = this;

			this.$media.attr('src', feed);

			console.log(feed);

			// Check for images loaded before appending.
			this.$media.load(function() {
				that.$el.html('');
				// Append new stream image to view.
				that.$el.append(that.$media);
				// Resize wrapper to match image size.
				that.resize();
				that.$el.append(that.translucent);
			});
		},
		addFancyElements: function() {
			// Awesome spinny preloader provided by spin.js :).
			this.spinner = new Spinner({
				color:'#eee'
			});

			// Position spinner in center of video feed.

			this.translucent = $('<div />').addClass('transparentBox').hide();
		},
		fullScreen: function() {
			// Create translucent background over app during full screen mode.
			$('.transparentBox').toggle();
			// Display player controls at bottom of screen
			$('#player-controls').toggleClass('fullScreenControls');
			// Make stream take up full window.
			app.View.FeedImage.$el.toggleClass('fullScreen');

			// Otherwise, app wrapper elongates to match bottom of image.
			this.resize();
		},
		listen: function() {
			var that = this;
			// Resize for responsive design.
			$(window).on('resize', this.resize);
			// Provides preloading image.
			this.listenTo(app.Model.Feed, 'change:fullRequest', that.loading);
			// Render when stream when new view selected
			this.listenTo(app.View.FeedImage, 'newStreamInitialized', that.render);
			// Handle full screen reuquests.
			this.listenTo(app.View.FullScreenButton, 'fullScreen', that.fullScreen);
		},
		loading: function() {
			this.spinner.spin(this.el);
		},
		loadFail: function() {
			this.spinner.stop();
			this.$el.html('');
			this.$el.append("<h1 class='telepresence-message'>Unable to load stream</h1>");
		},
		loadSuccess: function() {
			this.spinner.stop();
			this.$el.addClass('stream-loaded');
		},
		resize: function() {
			var imgSize;

			if(app.View.FeedImage.$el.height()) {
				imgSize = app.View.FeedImage.$el.height();
				this.$el.css({'height': imgSize});
			}
		}
	});

	return {
		initialize: function() {
			stream = new Stream();
		},
		load: function(id) {
			var Cameras = require('Collection/Cameras'),
				Cam     = Cameras.get(id),
				feed    = Cam.get('feed');

			stream.render(feed);
			feed.getStream();

			this.resize = stream.resize;
			this.fullScreen = stream.fullScreen;
		}
	};
});