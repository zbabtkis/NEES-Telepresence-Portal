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

						console.log(camera);

						vControls.initialize(camera);
						cControls.initialize(camera);

						camera.loadMedia();
					});
		    	}

		});

	  	return {
	    		initialize: function() {
					router = new Router(),
					Cameras = new Cameras();
			
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
