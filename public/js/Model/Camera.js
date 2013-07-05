define([
	  'underscore'
	, 'backbone'], 

function(_, Backbone) {
	'use strict';

	var Camera;

	Camera = Backbone.Model.extend({
		defaults: {
			baseUrl: Telepresence.nodeServer + 'streams/',
			framerate: 1,
			isOn: false
		},
		parse: function(response) {
			response.bookmarks = JSON.parse(response.bookmarks);

			return response;
		},
		initialize: function() {
			var _this = this;

			_.bindAll(this);

			this.set('feed', this.get('baseUrl') + this.get('id'));

			Telepresence.socket.on('streamEnded:' + this.get('id'), function(id) {
				_this.set('isOn', false);
			});

			Telepresence.socket.on('cameraUpdated:' + this.get('id'), this.fetch);

			this.on('change:framerate', this.loadMedia);

			this.on('reposition', function(location) {
				var pos = this.get('bookmarks')[location].position;

				this.set({
					'value_tilt': pos.v,
					'value_pan': pos.h
				});
			});

			this.on('change', function() {
				Backbone.sync('update', this);
			});
		},
		loadMedia: function() {
			var frameRate = this.get('framerate'),
				socketInfo = '?random=' + Math.random() + '&socketID=' + Telepresence.socket.socket.sessionid;;

			// @TODO: Implement feature detation and use polyfill if browser doesn't support mjpeg.
			
			this.set('media', this.get('feed') + '/' + frameRate + socketInfo);

			return this;
		},
        center: function(left, top, width, height) {
            $.ajax({
                type: 'PUT',
                url: Telepresence.nodeServer + 'streams/' + this.get('id') + '/center',
                data: {
                    left: left,
                    top: top,
                    width: width,
                    height: height
                },
                success: function(data) {
                    console.log(data);
                }
            });
        },
		_polyfill: function() {
			var _this = this,
				fameRate = this.get('framerate'),
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