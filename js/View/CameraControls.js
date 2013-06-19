define([
	  'Collection/Cameras'
	, 'vendor/Kendo/kendo.slider.min'
	, 'vendor/Kendo/kendo.dropdownlist.min'
	, 'backbone.kendowidget'
	, 'underscore'
	, 'backbone'
	, 'domReady'], 

	function(cameras) {
	'use strict';

	var SliderPan, SliderTilt, SliderZoom,
		SliderFocus, SliderIris, LocationPicker,
		$ = jQuery;

	$('.k-slider-selection').css('background-color', 'none');

	$('.k-button').click(function(e) {
		e.preventDefault();
	});

	SliderPan = Backbone.KendoWidget.extend({
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
		actionBind: 'panTo'
	});

	SliderTilt = Backbone.KendoWidget.extend({
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
		actionBind: 'tiltTo'
	});

	SliderZoom = Backbone.KendoWidget.extend({
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
		actionBind: 'zoomTo'
	});

	SliderFocus = Backbone.KendoWidget.extend({
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
		actionBind: 'focusTo'
	});

	SliderIris = Backbone.KendoWidget.extend({
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
		actionBind: 'irisTo'
	});

	// @TODO -- Replace with actual model.
	var locationData = [
		{text: 'Home', value: '1'},
		{text: 'River', value: '2'},
		{text: 'Hut', value: '3'},
		{text: 'Shurbs', value: '4'}
	]

	LocationPicker = Backbone.KendoWidget.extend({
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

	var Controls = new Object();

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

	return {
		initialize: function() {
			Controls.sliderPan      = new SliderPan();
			Controls.sliderTilt     = new SliderTilt();
			Controls.sliderZoom     = new SliderZoom();
			Controls.sliderFocus    = new SliderFocus();
			Controls.sliderIris     = new SliderIris();
			Controls.locationPicker = new LocationPicker();

			fixLabels();
		},
		enable: function() {
			var AppController = this;

			Telepresence.debug('Enabling Controls');

			_.each(Controls, function(control) {
				control.enable();
				AppController.listenTo(control, 'valueChange', function(widgInfo) {
					Telepresence.debug('valueChange triggered on AppController');
					this.trigger('change:cameraControl', widgInfo);
				});
			});
		},
		disable: function() {
			var AppController = this;

			Telepresence.debug('Disabling Controls');

			_.each(Controls, function(control) {
				control.disable();
				AppController.stopListening(control, 'change:cameraControl');
			});
		},
		set: function(ctrl, val) {
			Controls[ctrl].value(val);
		}
	}
});