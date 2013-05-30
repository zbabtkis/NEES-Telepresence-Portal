define([
	  'Model/FrameRate'
	, 'View/Stream'
	, 'vendor/Kendo/kendo.numerictextbox.min'
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

		FramerateFlipper = Backbone.View.extend({
			el: '#framerate-selector',
			initialize: function() {
				var fr = this.$el.kendoNumericTextBox({
					min: 0,
					max: 10,
					decimals: 0,
					format: "# fps"
				}).data("kendoNumericTextBox");

				fr.bind('change', this.change);
				FrameRate.on('change:value', this.update, fr);

			},
			change: function(e) {
				FrameRate.set('value', e.sender._value);
			},
			update: function(e) {
				var value = e.get('value');

				this.value(value);
			}
		});


		VideoControls = Backbone.View.extend({
			el: '#player-controls',
			initialize: function() {
				Stream.on('loadFail', this._disable, this);
				Stream.on('loadSuccess', this._enable, this);

				var fsButton = new FullSizeButton(),
					pButton  = new PlayButton(),
					frFlipper = new FramerateFlipper();

				this.$el.hide();

				this.$el.append(pButton.$el);
				this.$el.append(fsButton.$el);
			},
			_enable: function() {
				this.$el.fadeIn();
			},
			_disable: function() {
				this.$el.fadeOut('slow');
			}
		});

		return {
			initialize: function() {
				controls = new VideoControls();
			}
		};
	}
);
