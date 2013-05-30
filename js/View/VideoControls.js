define([
	  'Model/FrameRate'
	, 'View/Stream'
	, 'vendor/Kendo/kendo.numerictextbox.min'
	, 'backbone.kendowidget'
	, 'backbone'
	, 'domReady'], 

	function(FrameRate, Stream) {
		var PlayButton, FullScreenButton,
			FramerateFlipper, framerateFlipper,
			VideoControls, controls,
			$ = jQuery;

		PlayButton = Backbone.View.extend({
			tagName: 'i',
			initialize: function() {
				this.listenTo(FrameRate, 'change:value', this._getState);
				this._getState();
			},
			events: {
				'click': '_playPause'
			},
			_playPause: function() {
				// Check current state and change it.
				if(FrameRate.get('value') !== 0) {
					FrameRate.set('value', 0);
				} else  {
					FrameRate.set('value', 1);
				}
			},
			_getState: function() {
				// If framerate slider changes from play to pause, only render change for button.
				if(FrameRate.get('value') !== 0) {
					this.$el.attr('class', 'icon-pause icon icon-2x');
				} else  {
					this.$el.attr('class', 'icon-play icon icon-2x');
				}
			}
		});

		FullSizeButton = Backbone.View.extend({
			tagName: 'i',
			className: 'icon-fullscreen icon icon-2x',
			events: {
				'click': 'toggle'
			},
			toggle: function() {
				Stream.trigger('fullScreen');
			}
		});

		FramerateFlipper = Backbone.KendoWidget.extend({
			el: '#framerate-selector',
			options: {
				min: 0,
				max: 10,
				decimals: 0,
				format: "# fps"
			},
			widget: 'kendoNumericTextBox',
			actionBind: 'updateFrameRate'
		});

		var Controls = new Object();

		return {
			initialize: function() {
				var playButton   = new PlayButton();
				var fullScreenButton  = new FullSizeButton();
				Controls.framerateFlipper  = new FramerateFlipper();
			},
			enable: function() {
				var AppController = this;

				_.each(Controls, function(control) {
					control.enable();
					AppController.listenTo(control, 'valueChange', AppController.videoControl);
				});
			},
			disable: function() {
				var AppController = this;

				_.each(Controls, function(control) {
					control.disable();
					AppController.stopListening(control, 'valueChange', AppController.videoControl);
				});
			},
			set: function(ctrl, val) {
				Controls[ctrl].value(val);
			}
		}
});
