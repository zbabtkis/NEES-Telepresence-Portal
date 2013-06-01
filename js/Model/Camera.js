define([
		'Model/FrameRate'
	, 'underscore'
	, 'backbone'], 

	function(FrameRate, settings) {
	var _robotic, _polyfill, Camera;

	// Adds robotic functionality to Backbone's model for triggering changes on a flextps camera.
	_robotic = function(action) {
		var _this = this;

		console.log(this);

		jQuery.ajax({
			url: _this.get('robotic'),
			data: action,
			dataProcess: false,
			dataType: 'jsonp'
		});
	};

	_polyfill = function() {
		var _this = this,
			fameRate = FrameRate.get('value'),
			valFr = 1000;

		function setFeed() {
			this.set('media', this.get('feed') + '/jpeg?reset=' + Math.random());
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

	Camera = Backbone.Model.extend({
		defaults: {
			'baseUrl': Drupal.settings.flex_api
		},
		initialize: function() {
			var feed = this.get('baseUrl') + this.get('site_name') + '/' + this.get('camera_name');

			this.set('feed', feed);
			this.set('robotic', feed + '/robotic');

			FrameRate.on('change:value', this.loadMedia);

			this.on('change', function() {
				Backbone.sync('update', this);
			});
		},
		loadMedia: function() {
			var frameRate = FrameRate.get('value');
			// Break and use polyfill if browser doesn't support mjpeg.
			if(jQuery.browser.msie && jQuery.browser.version < 10.0) _polyfill.apply(this, null);

			if(frameRate === 0) {
				this.set('media', this.get('feed') + '/' + 'jpeg');
			} else {
				this.set('media', this.get('feed') + '/mjpeg/' + frameRate);
			}

			return this;
		},
		action: function(action, value) {
			this['_' + action](value);
		},
		_refresh: function() {
			var currentRequest = this.get('media');
			var time = '?timestamp=' + Date.now();
			// Allow view to detect change in feed by appending current time to url.
			this.set('media', currentRequest + time);
		},
		_screenshot: function() {
			var loc = this.get('feed') + '/jpeg?attachment=true';
			window.location.href = loc;
		},
		_home: function() {
			_robotic.call(this, '?ctrl=home');
		},
		_position: function(args) {
			_robotic.call(this, "?ctrl=apan&amp;imagewidth=" + args.imgWidth + "&amp;value=?" + args.width);
			_robotic.call(this, "?ctrl=atilt&amp;imageheight=" + args.imgHeight + "&amp;value=?" + args.height);
		},
		_panTo: function(val) {
			var action = 'ctrl=apan&amp;imagewidth=100&amp;value=?' + val + ',13';

			_robotic.call(this, action);
		},
		_tiltTo: function(val) {
			var action = 'ctrl=atilt&amp;imageheight=100&amp;value=?13,' + (100 - val);

			_robotic.call(this, action);
		},
		_zoomTo: function(val) {
			var action = 'ctrl=azoom&amp;imagewidth=20&amp;value=?' + (10 + val) + ',13';

			_robotic.call(this, action);
		},
		_focusTo: function(val) {
			var action = 'ctrl=afocus&amp;imagewidth=20&amp;value=?' + (10 + val) + ',9';

			_robotic.call(this, action);
		},
		_irisTo: function(val) {
			var action = 'ctrl=airis&amp;imagewidth=20&amp;value=?' + (10 + val) + ',9';

			_robotic.call(this, action);
		}
	});

	return Camera;
});