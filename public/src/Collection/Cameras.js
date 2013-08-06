define([
	  'Model/Camera'
	, 'underscore'
	, 'backbone'],

  	function(Camera, _, Backbone) {
  	  	var Cameras, cameras;
		
  	  	Cameras = Backbone.Collection.extend({
			model: Camera,
			url: Telepresence.nodeServer + 'cameras',
			group: function() {
				var groups = _.groupBy(this.toJSON(), function(camera) { return camera.site_name; });
				
				_.each(groups, function(group, name) {
					groups[name].safeName = name.replace(/ /g, '-');
				});

				return groups;
	  		}  	
	  	});

  		return Cameras;
});