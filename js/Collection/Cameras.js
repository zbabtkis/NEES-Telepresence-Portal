define([
	  'Model/Camera'
	, 'underscore'
	, 'backbone'],

  	function(Camera, settings) {
  	  	var Cameras, cameras;
		
  	  	Cameras = Backbone.Collection.extend({
			model: Camera,
			url: function() {
				return Telepresence.nodeActive ? Telepresence.nodeServer : Drupal.settings.module_api + '/cameras';
			},
			poll: function() {
				var _this = this;

				_.bindAll(this, 'fetch');

				if(Telepresence.nodeActive) {
					Telepresence.socket.on('cameraUpdated', this.fetch);
				} else {
					this.poller = setInterval(this.fetch, 5000);
				}
		    },
		    stopPolling: function() {
		    	if(this.poller) {
		    		clearInterval(this.poller);
		    	}
		    },
			group: function() {
				var _this = this,
					groups;
				
				groups = this.groupBy(function(camera) {
					return camera.get('site_name');
				});
	
				return {
					toJSON: function() {
						var struct = [];

						function organize(models, group) {
							var JSONified = [],
								safeName;
			
							_.each(models, function(model, num) {
								JSONified.push(model.toJSON());
							});

							safeName = _this.findWhere({'site_name':group})
								.get('site_safe_name');
							
							struct.push({
								name: group,
								models: JSONified,
								safeName: safeName
							});
						}
			
				  		// Make model attributes directly available for templating.
				  		if(groups.length !== 0) {
				  			_.each(groups, organize);
				  		}
				
				  		var sorted = _.sortBy(struct, function(group) {
				  		  return group.name;
				  		});
				
				  		return sorted;
					},
					groups: groups
				};
			}
  	  	});
		
  	  	cameras = new Cameras();

  	  	window.cameras = cameras;

  		return cameras;
});