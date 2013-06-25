define([
	  'Model/FrameRate'
	, 'underscore'
	, 'backbone'], 

function(FrameRate, _, Backbone) {
	'use strict';

	var Camera;

	Camera = Backbone.Model.extend({
		defaults: {
			baseUrl: Telepresence.nodeServer + 'streams/',
			framerate: 1,
			isOn: false
		},
		initialize: function() {
			var _this = this;

			_.bindAll(this);

			this.set('feed', this.get('baseUrl') + this.get('id'));

			Telepresence.socket.on('streamEnded:' + this.get('id'), function(id) {
				_this.set('isOn', false);
			});

			Telepresence.socket.on('cameraUpdated:' + this.get('id'), this.fetch);

			FrameRate.on('change:value', this.loadMedia, this);

			this.on('change', function() {
				Backbone.sync('update', this);
			});
		},
		loadMedia: function() {
			var frameRate = FrameRate.get('value'),
				socketInfo = '?random=' + Math.random() + '&socketID=' + Telepresence.socket.socket.sessionid;;

			// @TODO: Implement feature detation and use polyfill if browser doesn't support mjpeg.
			
			this.set('media', this.get('feed') + '/' + frameRate + socketInfo);

			return this;
		},
		_polyfill: function() {
			var _this = this,
				fameRate = FrameRate.get('value'),
				valFr = 1000;

			function setFeed() {
				this.set('framerate', 1);
				this.loadMedia();
			}

			if(fameRate != 0 && fameRate <= 10) {
				var valFr = (11 - fameRate) * 1000;
			} else {
				setFeed();
				return 0;
			}
			
			// Refresh image at interval by resetting the fullRequest address with a random number appended to it to trigger change.
			this.intervalId = setInterval(function() {
				if(fameRate != 0) {
					setFeed();
				} else {
					clearInterval(that.intervalId);
				}
			}, valFr);

			return this;
		}
	});

	return Camera;
});