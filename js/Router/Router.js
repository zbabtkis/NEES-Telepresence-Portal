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
							this.navigate('sites/' + id, {trigger: true, replace: true});
						});
					});
		    	},

		    	camera: function(id) {
					var _this = this;

					define('CameraController',['Collection/Cameras','View/Stream' , 'View/CameraControls'], function(Cameras, Stream, CameraControls) {
						function renderStream() {
							console.log(this.get('media'));
							Stream.render(this.get('media'));
						}

						function updateControls() {
							CameraControls.set('sliderPan', this.get('value_pan'));
							CameraControls.set('sliderTilt', this.get('value_tilt'));
							CameraControls.set('sliderZoom', this.get('value_zoom'));
							CameraControls.set('sliderFocus', this.get('value_focus'));
							CameraControls.set('sliderIris', this.get('value_iris'));
						}

						function updateCameraPosition() {
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
							this.action('position', args);
						}

						function executeCameraControl(widgInfo) {
							var save = {
								'action': widgInfo.action
							}
							save[widgInfo.boundTo] = widgInfo.value;

							this.set(save);
							this.action(widgInfo.action, widgInfo.value);
						}

						function listen(camera) {
							Stream.on('loadFail', CameraControls.disable, _this);
							Stream.on('loadSuccess', CameraControls.enable, _this);

							Stream.on('loadFail', Cameras.stopPolling, Cameras);
							Stream.on('loadSuccess', Cameras.poll, Cameras);

							camera.on('renderMe', renderStream, camera);

							camera.on('change', updateControls, camera);

							Stream.on('streamClicked', updateCameraPosition, camera);

							_this.on('change:cameraControl', executeCameraControl, camera);

							if(Telepresence.nodeActive) {
								// Prompt stream reload once 'streamEnded' event is emitted from server.
								Telepresence.socket.once('streamEnded', function(info) {
									var strId = parseInt(info.id, 10),
										strFr = parseInt(info.framerate, 10);

									// If we are viewing stream that has ended.
									if(strFr === camera.get('id')) {
										Stream.promptReload();
									}
								});	
							}
						}

						return {
							initialize: function(id) {
								var camera = Cameras.get(id)
								listen(camera);
								camera.loadMedia();
							}
						}
				    });

				    	
				    define('VideoController',['Model/FrameRate','View/Stream','View/VideoControls'], function(FrameRate, Stream, VideoControls) {
				    	Stream.on('loadFail', VideoControls.disable, _this);
						Stream.on('loadSuccess', VideoControls.enable, _this);
						
						FrameRate.on('change:value', updateViews);
						
						_this.on('change:videoControl', videoControl);
						
						updateViews();
					    
					   	function updateViews() {
							var val = FrameRate.get('value');
						
							VideoControls.set('framerateFlipper', val);
						}

						function videoControl(obj) {
							FrameRate.set('value', obj.value);
						}
				    });

					require(['CameraController', 'VideoController'], function(CameraController, VideoController) {
						_this.list();
						CameraController.initialize(id);
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
	    		},

	    		navigate: function(to) {
	    			router.navigate(to, {trigger: true, replace: true})
	    		}
	  	};

});
