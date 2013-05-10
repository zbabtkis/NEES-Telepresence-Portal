define(['Model/FrameRate','libs/backbone','domReady'], function($) {
		var PlayButton, FSButton
		/** Button that toggles play/pause on feed */
		PlayButton = Backbone.View.extend({
			tagName: 'button',
			className: 'play-pause',
			attributes: function() {
				return {
					'data-control-option': 'play'
				};
			},
			initialize: function() {
				this.$parent = $('#player-controls');
				this.$parent.append(this.$el.hide());
				this.$el.click(this.playPause);
			},
			enable: function() {
				this.$el.fadeIn();
			},
			disable: function() {
				this.$el.fadeOut('slow');
			},
			playPause: function() {
				// Check current state and change it.
				if(app.Model.FrameRate.get('value') != '0') {
					app.Model.FrameRate.set('value', 0);
				} else  {
					app.Model.FrameRate.set('value', 5);
				}
			},
			listen: function() {
				// Listen for change in framerate -- this could mean video has paused if fr is 0!
				app.Model.FrameRate.on('change:value', this.updateButton, this);
			},
			updateButton: function() {
				// If framerate slider changes from play to pause, only render change for button.
				if(app.Model.FrameRate.get('value') != '0') {
					this.$el.removeClass('play');
				} else  {
					this.$el.addClass('play');
				}
			}
		});
		FSBtn = Backbone.View.extend({
			tagName: 'button',
			initialize: function() {
				var that = this;
				this.$parent = $('#player-controls');
				this.$el.attr('id','fullScreenButton').addClass('camera-action');
				this.$el.toggle(function() {
						$(this).toggleClass('small');
						that.trigger('fullScreen');
					},
					function() {
						$(this).toggleClass('small');
						that.trigger('fullScreen');
					}
				);
				this.$parent.append(this.$el.hide());
			},
			enable: function() {
				this.$el.fadeIn();
			},
			disable: function() {
				this.$el.fadeOut('slow');
			}
		});
	}(jQuery)
);