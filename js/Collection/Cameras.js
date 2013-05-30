define([
	  'Model/Camera'
	, 'underscore'
	, 'backbone'],

  	function(Camera, settings) {
  	  	var Cameras, cameras;
		
  	  	Cameras = Backbone.Collection.extend({
			model: Camera,
			url: Drupal.settings.module_api + '/cameras',
			poll: function(delay) {
				var _this = this;
			    
			    this.poller = setInterval(function() {
			    	_this.fetch();
			    }, delay);
		    },
		    stopPolling: function() {
		    	clearInterval(this.poller);
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
				  		_.each(groups, organize);
				
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