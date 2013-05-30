define([
	  'Model/FrameRate'
	, 'View/Stream'
	, 'View/VideoControls'
	, 'underscore'
	, 'backbone'],

	function(FrameRate, Stream, VideoControls) {
		'use strict';

		// Controller constructor.
		var Controller = new Object({
			initialize: function() {
				var _this = this;

				_.extend(this, Backbone.Events);

				VideoControls.initialize();

				Stream.on('loadFail', VideoControls.disable, this);
				Stream.on('loadSuccess', VideoControls.enable, this);

				FrameRate.on('change:value', this.updateViews);

				this.updateViews();

				return this;
			},
			updateViews: function() {
				var val = FrameRate.get('value');
				VideoControls.set('framerateFlipper', val);
			},
			videoControl: function(evt) {
				FrameRate.set('value', evt.value);
			}
		});

		return Controller;
});