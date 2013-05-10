define(['libs/domReady'], function() {
	'use strict';

	var StreamView     = require('View/Stream'),
		videoControls  = require('View/VideoControls'),
		cameraControls = require('Vide/CameraControls'),
		feedModel      = require('Model/Feed'),
		robotModel     = require('Model/Robot'),
		FeedImage, feed;

	FeedImage = Backbone.View.extend({
		tagName: 'img',
		className: 'feed-image',
		initialize: function() {
			if(this._cameraAngle) {
				this.$el.css('cursor','pointer');
			}
		},
		listen: function() {
			var that = this;
			_.bindAll(this);
			// Change feed source when new source has been loaded into model.
			this.listenTo(feedModel, 'change:fullRequest', that.change);
		},
		change: function() {
			// Change image source to new feed if image load is success -- otherwise handle feed failure.
			this.$el.attr('src',feedModel.get('fullRequest')).error(this._fail).load(this._loaded);
		},
		_fail: function() {
			this.$el.hide();
			StreamView.loadFail();
			this._disableActions();
		},
		_loaded: function() {
			this.$el.show();
			app.View.Stream.loadSuccess();
			this.trigger('newStreamInitialized');
			this._enableActions();
		},
		_enableActions: function() {
			app.View.Play.enable();
			app.View.FullScreenButton.enable();
			app.View.Slider.enable();
			app.View.CameraControl.enable();
			if(typeof this.$el.RemoveClass == 'function') {
				this.$el.RemoveClass('fail image-default');
			}
		},
		_disableActions: function() {
			app.View.Play.disable();
			app.View.FullScreenButton.disable();
			app.View.Slider.disable();
			app.View.CameraControl.disable();
			this.$el.addClass('fail');
		},
		events: {
			'click': '_cameraAngle'
		},
		_cameraAngle: function(e) {
			var x, y, scale, args;

			// Get current point on the graph for sending to Robot model.
			x = e.pageX - this.$el.offset().left + ',13';
			y = '13,' + e.pageY - this.$el.offset().top;

			// For camera to set camera position.
			args = {
				'width': x,
				'height': y,
				'imgWidth': this.el.width,
				'imgHeight': this.el.height
			};

			// Send command to Robot.
			app.Model.Robot.robotCommand('position', args);
		}
	});

	feed = new FeedImage();

	return {

	};
}(jQuery));