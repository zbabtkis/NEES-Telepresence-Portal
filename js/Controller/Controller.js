define([
	  'Collection/Cameras'
	, 'View/Tabs'
	, 'View/Stream'
	, 'View/CameraControls'
	, 'underscore'
	, 'backbone'],

	function(Cameras, Tabs, Stream, CameraControls) {
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
				Cameras.poll(5000);
			},
			openFeed: function(id) {
				var cam = Cameras.get(id),
					media;

				this.unload();

				cam.loadMedia();
				Stream.render(cam.get('media'));

				this.listenTo(cam, 'change', this.saveCamera);
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

				console.log('change detected');

				CameraControls.set('sliderPan', cam.get('value_pan'));
				CameraControls.set('sliderTilt', cam.get('value_tilt'));
				CameraControls.set('sliderZoom', cam.get('value_zoom'));
				CameraControls.set('sliderFocus', cam.get('value_focus'));
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