define([
	  'Model/FrameRate'
	, 'underscore'
	, 'modernizr'
	, 'backbone'], 

	function(FrameRate, _, Modernizr, Backbone) {
	var Camera;

	Camera = Backbone.Model.extend({
		defaults: {
			baseUrl: Telepresence.nodeServer,
			framerate: 1
		},
		initialize: function() {
			this.set('feed', this.get('baseUrl') + this.get('id'));

			Telepresence.socket.on('streamEnded', function() {
				alert('Stream ended');
			});

			FrameRate.on('change:value', this.loadMedia, this);

			_.bindAll(this, 'fetch');

			Telepresence.socket.on('cameraUpdated:' + this.get('id'), this.fetch);
		},
		loadMedia: function() {
			var frameRate = FrameRate.get('value'),
				socketInfo = '?socketID=' + Telepresence.socket.socket.sessionid;;

			// @TODO: Implement feature detation and use polyfill if browser doesn't support mjpeg.
			
			this.set('media', this.get('feed') + '/' + frameRate + socketInfo);

			this.trigger('renderMe');

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