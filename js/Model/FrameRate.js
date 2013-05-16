define(['underscore','backbone'], function(){
	var FrameRate = Backbone.Model.extend({
		defaults: {
    		'value': 1, // Initial value on framerate slider
    		'max'  : 10 // Max on framerate slider
   		}
  	});

  	return new FrameRate;
});