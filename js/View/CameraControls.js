define(['vendor/Kendo/kendo.slider.min' ,'underscore', 'backbone', 'domReady'], function() {
	'use strict';

	var SliderPan, sliderPan,
		SliderTilt, sliderTilt;

	SliderPan = Backbone.View.extend({
		el: '#slider-pan',
		initialize: function() {
			this.$el.kendoSlider({
				orientation: "horizontal",
                min: -50,
                max: 50,
                smallStep: 2,
                largeStep: 1,
			});
		}
	});

	SliderTilt = Backbone.View.extend({
		el: '#slider-tilt',
		initialize: function() {
			this.$el.kendoSlider({
				orientation: "vertical",
                min: -50,
                max: 50,
                smallStep: 2,
                largeStep: 1,
			});
		}
	});

	return {
		initialize: function() {
			sliderPan = new SliderPan();
			sliderTilt = new SliderTilt();
		}
	};
})