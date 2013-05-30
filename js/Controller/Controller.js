define([
	  'Collection/Cameras'
	, 'Model/FrameRate'
	, 'View/Tabs'
	, 'View/Stream'
	, 'View/CameraControls'
	, 'View/VideoControls'
	, 'underscore'
	, 'backbone'],

	function(Cameras, FrameRate, Tabs, Stream, CameraControls, VideoControls) {
		'use strict';

		// Controller constructor.
		var Controller = new Object({
			collection: Cameras,
			initialize: function() {
				var _this = this;

				_.extend(this, Backbone.Events);

				Cameras.fetch({
					success: this.setup,
					fail: function() {
						alert("There was an error loading the camera feeds. Please try again later.")
					}
				});

				CameraControls.initialize();

				Stream.on('loadFail', CameraControls.disable, this);
				Stream.on('loadSuccess', CameraControls.enable, this);

				return this;
			},
			setup: function() {
				Backbone.history.start();
				if(Telepresence.DEBUG) {
					Cameras.poll(5000);
				}
			},
			openFeed: function(id) {
				var cam = Cameras.get(id),
					media;

				function updateStreamView() {
					Stream.render(cam.get('media'));
				}

				this.unload();

				FrameRate.on('change:value', cam.loadMedia);

				cam.loadMedia();
				updateStreamView();

				cam.on('change', this.saveCamera, cam);
				cam.on('change:media', updateStreamView, cam);

				this.bindData(cam);

				this._currentId = id;
			},
			unload: function() {
				var cam = Cameras.get(this._currentId);

				this.stopListening();
				if(cam) {
					cam.off('change');
				}
			},
			bindData: function(camera) {
				camera.on('change', this.updateWidgets);
				this.updateWidgets(camera);
			},
			updateWidgets: function(camera ) {
				var cam = camera || Cameras.get(this._currentId);

				CameraControls.set('sliderPan', cam.get('value_pan'));
				CameraControls.set('sliderTilt', cam.get('value_tilt'));
				CameraControls.set('sliderZoom', cam.get('value_zoom'));
				CameraControls.set('sliderFocus', cam.get('value_focus'));
				CameraControls.set('sliderIris', cam.get('value_iris'));
			},
			saveCamera: function(cam) {
				Backbone.sync('update', cam);
			},
			cameraControl: function(obj) {
				var cam = Cameras.get(this._currentId);

				cam.set(obj.boundTo, obj.value);
				cam.action(obj.action, obj.value);
			}
		});

		return Controller;
});