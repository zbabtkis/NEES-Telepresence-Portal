define([
	  'backbone'
	, 'jquery'
	, 'backbone.kendowidget'
	, 'domReady'], 

function(Backbone, $) {
	'use strict';

	$('.k-slider-selection').css('background-color', 'none');

	$('.k-button').click(function(e) {
		e.preventDefault();
	});

	var SliderPan = Backbone.KendoWidget.extend({
		el: '#slider-pan',
		options: {
			orientation: "horizontal",
            min: 0,
            max: 100,
            smallStep: 1,
            largeStep: 20,
            showButtons: true
		},
		widget: 'kendoSlider',
		dataBind: 'value_pan',
	});

	var SliderTilt = Backbone.KendoWidget.extend({
		el: '#slider-tilt',
		options: {
			orientation: "vertical",
            min: 0,
            max: 100,
            smallStep: 1,
            largeStep: 20,
            showButtons: true
		},
		widget: 'kendoSlider',
		dataBind: 'value_tilt',
	});

	var SliderZoom = Backbone.KendoWidget.extend({
		el: '#zoom-control',
		options: {
			orientation: "vertical",
            min: -10,
            max: 10,
            smallStep: 1,
            largeStep: 20,
            showButtons: true
		},
		widget: 'kendoSlider',
		dataBind: 'value_zoom',
	});

	var SliderFocus = Backbone.KendoWidget.extend({
		el: '#focus-control',
		options: {
			orientation: 'vertical',
			min: -10,
			max: 10,
			smallStep: 1,
			largeStep: 20,
			showButtons: true
		},
		widget: 'kendoSlider',
		dataBind: 'value_focus',
	});

	var SliderIris = Backbone.KendoWidget.extend({
		el: '#iris-control',
		options: {
			orientation: 'vertical',
			min: -10,
			max: 10,
			smallStep: 1,
			largeStep: 20,
			showButtons: true
		},
		widget: 'kendoSlider',
		dataBind: 'value_iris',
	});

	// @TODO -- Replace with actual model.
	var locationData = [
		{text: 'Home', value: '1'},
		{text: 'River', value: '2'},
		{text: 'Hut', value: '3'},
		{text: 'Shurbs', value: '4'}
	]

	var LocationPicker = Backbone.KendoWidget.extend({
		el: '#location-picker',
		widget: 'kendoDropDownList',
		options: {
            dataTextField: "text",
            dataValueField: "value",
            dataSource: locationData,
            index: 0,
            change: function(e) {
            	console.log(e);
            }
        }
	});

	// Kendo currently has no way of modifying these -- FIX THIS WHEN IT DOES.
	function fixLabels() {
		// Change zoom slider labels.
		$('.zoom-control').eq(0)
			.find('.k-label').eq(0)
			.html('In');
		$('.zoom-control').eq(0)
			.find('.k-label').eq(1)
			.html('Out');

		// Change focus slider labels.
		$('.focus-control').eq(0)
			.find('.k-label').eq(0)
			.html('In');
		$('.focus-control').eq(0)
			.find('.k-label').eq(1)
			.html('Out');

		// Change iris slider labels.
		$('.iris-control').eq(0)
			.find('.k-label').eq(0)
			.html('Open');
		$('.iris-control').eq(0)
			.find('.k-label').eq(1)
			.html('Close');
	}

	var Controls = new Object();

	return {
		initialize: function(model) {
			Controls.sliderPan      = new SliderPan({ model: model });
			Controls.sliderTilt     = new SliderTilt({ model: model });
			Controls.sliderZoom     = new SliderZoom({ model: model });
			Controls.sliderFocus    = new SliderFocus({ model: model });
			Controls.sliderIris     = new SliderIris({ model: model });
			Controls.locationPicker = new LocationPicker({ model: model });

			fixLabels();

			return Controls;
		},
		destroy: function() {
			_.each(Controls, function(control) {
				control.remove();
			});
		}
	}
});