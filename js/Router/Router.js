define([
    'Collection/Cameras'
  , 'underscore'
  , 'backbone'], 

	function (Cameras) {
		'use strict';

	  	var Router, router;

	  	Router = Backbone.Router.extend({

		    	routes: {
				'': 'list',
				'sites': 'list',
				'help': 'help',
				'sites/:cam': 'camera'
		    	},

		    	help: function() {
				 require(['View/Info'], function(Info) {	
					Info.render();
				 });
		    	},

		    	list: function() { 
				var _this = this;

				require(['View/List'], function(List) {        
					List.render();
					  
					_this.listenTo(List, 'cameraSelected', function(id) {
						this.navigate('sites/' + id, {trigger: true});
					});
				});
		    	},

		    	camera: function(id) {
				var _this = this;

				require(['Controller/Controller', 'Collection/Cameras', 'Model/FrameRate' , 'View/Stream' , 'View/CameraControls'], function(Controller, Cameras, FrameRate, Stream, CameraControls) {
					var camera = Cameras.get(id);

					_this.list();

					Stream.on('loadFail', CameraControls.disable, this);
					Stream.on('loadSuccess', CameraControls.enable, this);

					Stream.on('loadFail', Cameras.stopPolling, Cameras);
					Stream.on('loadSuccess', Cameras.poll, Cameras);

					camera.on('change:media', function() {
						Stream.render(camera.get('media'));
					});
					camera.on('change', function() {
						CameraControls.set('sliderPan', camera.get('value_pan'));
						CameraControls.set('sliderTilt', camera.get('value_tilt'));
						CameraControls.set('sliderZoom', camera.get('value_zoom'));
						CameraControls.set('sliderFocus', camera.get('value_focus'));
						CameraControls.set('sliderIris', camera.get('value_iris'));
					});

					Stream.on('streamClicked', function() {
						var x, y, scale, args;

						// Get current point on the graph for sending to Robot model.
						x = e.pageX - jQuery(e.target).offset().left + ',13';
						y = '13,' + e.pageY - jQuery(e.target).offset().top;

						// For camera to set camera position.
						args = {
							'width': x,
							'height': y,
							'imgWidth': e.target.width,
							'imgHeight': e.target.height
						};

						// Send command to Robot.
						camera.action('position', args);
					});

					camera.loadMedia();

					// @TODO find out what these do (related to CameraControls.js)
					//camera.set(obj.boundTo, obj.value);
					//camera.action(obj.action, obj.value);
				});
		    	}

		});

	  	return {
	    		initialize: function() {
				router = new Router();
		
				Cameras.fetch({
					success: function() {
						Backbone.history.start();
					},
					fail: function() {
						alert("There was an error loading the camera feeds. Please try again later.")
				  	}
				});
		
				this.navigate = router.navigate
	    		}
	  	};

});
