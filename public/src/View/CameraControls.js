define([
	  'backbone'
	, 'jquery'
	, 'toggle'
	, 'backbone.kendowidget'
	, 'domReady'], 

function(Backbone, $, ToggleSwitch) {
	'use strict';

	$('.k-slider-selection').css('background-color', 'none');

	$('.k-button').click(function(e) {
		e.preventDefault();
	});

	var Controls = new Object();

	var SliderPan = Backbone.KendoWidget.extend({
		el: '#slider-pan',
		options: {
			orientation: "horizontal",
            min: -170,
            max: 170,
            smallStep: 1,
            largeStep: 20,
            showButtons: true
		},
		widget: 'kendoSlider',
		dataBind: 'pan'
	});

	var SliderTilt = Backbone.KendoWidget.extend({
		el: '#slider-tilt',
		options: {
			orientation: "vertical",
            min: -80,
            max: 80,
            smallStep: 1,
            largeStep: 20,
            showButtons: true
		},
		widget: 'kendoSlider',
		dataBind: 'tilt'
	});

	var SliderZoom = Backbone.KendoWidget.extend({
		el: '#zoom-control',
		options: {
			orientation: "vertical",
            min: 1,
            max: 9999,
            smallStep: 1,
            largeStep: 20,
            showButtons: true
		},
		widget: 'kendoSlider',
		dataBind: 'zoom',
	});

	var SliderFocus = Backbone.KendoWidget.extend({
		el: '#focus-control',
		options: {
			orientation: 'vertical',
			min: 1,
			max: 9999,
			smallStep: 1,
			largeStep: 20,
			showButtons: true
		},
		widget: 'kendoSlider',
		dataBind: 'focus',
	});

	var SliderIris = Backbone.KendoWidget.extend({
		el: '#iris-control',
		options: {
			orientation: 'vertical',
			min: 1,
			max: 9999,
			smallStep: 1,
			largeStep: 20,
			showButtons: true
		},
		widget: 'kendoSlider',
		dataBind: 'iris'
	});

	var LocationPicker = Backbone.KendoWidget.extend({
		el: '#location-picker',
		widget: 'kendoDropDownList',
		options: {
            dataTextField: "text",
	        dataValueField: "value",
	        dataSource: [],
	        index: 0
        },
        emitter: 'reposition',
        setData: function() {
        	var locationData = [], titles;

        	if(this.model && this.model.get('bookmarks')) {
				titles = _.keys(this.model.get('bookmarks'));
				locationData = [];

				_.each(titles, function(title) {
					locationData.push({text: title, value: title})
				});
                
			}

			return locationData;
        }
	});

	var ToggleAutofocus = ToggleSwitch.extend({
		renderIn: '#toggles .autofocus',
		setup: function(model) {
			var _this = this;

			$(this.renderIn).html(this.$el);

			this.model.set('value', false);

			// ToggleSwitch Model.
			this.model.on('change:value', function(m, value) {
				Controls.sliderFocus.enable(!value);
				model.set('autoFocus', value);
			});

			this.render();
		}
	});

	var ToggleAutoiris = ToggleSwitch.extend({
		renderIn: '#toggles .autoiris',
		setup: function(model) {
			var _this = this;

			$(this.renderIn).html(this.$el);

			this.model.set('value', false);

			// ToggleSwitch Model.
			this.model.on('change:value', function(m, value) {
				Controls.sliderIris.enable(!value);
				model.set('autoIris', value);
			});

			this.render();
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

	return {
		initialize: function(model) {
			Controls.sliderPan      = new SliderPan({ model: model });
			Controls.sliderTilt     = new SliderTilt({ model: model });
			Controls.sliderZoom     = new SliderZoom({ model: model });
			Controls.sliderFocus    = new SliderFocus({ model: model });
			Controls.sliderIris     = new SliderIris({ model: model });
			Controls.locationPicker = new LocationPicker({ model: model });

			var toggleAutofocus = new ToggleAutofocus().setup(model);
			var toggleAutoIris  = new ToggleAutoiris().setup(model);
			

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