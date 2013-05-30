define(['Collection/Cameras' ,'vendor/Kendo/kendo.slider.min' ,'underscore', 'backbone', 'domReady'], function(cameras) {
	'use strict';

	var SliderPan, SliderTilt, SliderZoom,
		SliderFocus,
		$ = jQuery;

	$('.k-slider-selection').css('background-color', 'none');

	$('.k-button').click(function(e) {
		e.preventDefault();
	})

	function fixWidth() {
		var stream = $('#stream'),
			video = $("#video"),
			width = video.width(),
			tilt = $('.slider-tilt'),
			newWidth = width - tilt.width() - 40;

		stream.width(newWidth);
	}

	Backbone.KendoWidget = Backbone.View.extend({
		initialize: function() {
			var _this = this, widget;

			widget = this.$el[this.widget](this.options).data(this.widget);

			widget.bind('change', function(e) {
				var obj = {
					boundTo: _this.dataBind,
					action: _this.actionBind,
					value: e.value
				};

				_this.trigger('valueChange', obj);
			});

			// Controls should be disabled by default.
			widget.enable(false);

			this.enable = function() {
				widget.enable(true);
			}
			this.disable = function() {
				widget.enable(false);
			}
			this.value = function(val) {
				widget.value(val);
			}
		}
	})

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

	var Controls = new Object();

	$(window).resize(fixWidth);

	return {
		initialize: function(cam) {
			var model = cameras.get(cam);

			Controls.sliderPan   = new SliderPan();
			Controls.sliderTilt  = new SliderTilt();
			Controls.sliderZoom  = new SliderZoom();
			Controls.sliderFocus = new SliderFocus();

			fixWidth();
		},
		enable: function() {
			var AppController = this;

			Telepresence.debug('Enabling Controls');

			_.each(Controls, function(control) {
				control.enable();
				AppController.listenTo(control, 'valueChange', AppController.cameraControl);
			});
		},
		disable: function() {
			var AppController = this;

			Telepresence.debug('Disabling Controls');

			_.each(Controls, function(control) {
				control.disable();
				AppController.stopListening(control, 'valueChange', AppController.cameraControl);
			});
		},
		set: function(ctrl, val) {
			Controls[ctrl].value(val);
		}
	}
})