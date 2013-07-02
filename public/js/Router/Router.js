define([
    'Collection/Cameras'
  , 'underscore'
  , 'backbone'], 

	function (Cameras, _, Backbone) {
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
						var list = new List({collection: Cameras});
						
						list.render();

						_this.listenTo(list, 'cameraSelected', function(id) {
							this.navigate('sites/' + id, {trigger: true, replace: true});
						});
					});
		    	},

		    	camera: function(id) {
					var camera = Cameras.get(id);

					this.list();

					require(['View/Stream', 'View/VideoControls', 'View/CameraControls'], function(Stream, vControls, cControls) {
						var stream = new Stream({ model: camera });

						vControls.destroy();
						cControls.destroy();

						vControls.initialize(camera);
						cControls.initialize(camera);

						camera.loadMedia();

						// Provide Camera API
						Telepresence.API.getPosition = function() {
							var obj = {
								id: id,
								position: {
									h: camera.get('value_pan'),
									v: camera.get('value_tilt')
								}
							}

							return obj;
						}
					});
		    	}

		});

	  	return {
	    		initialize: function() {
					router = new Router(),
					window.Cameras = Cameras = new Cameras();
			
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
