define([
	  'underscore'
	, 'backbone'], 

function(_, Backbone) {
	'use strict';

	var Camera;

	Camera = Backbone.Model.extend({
		urlRoot: Telepresence.nodeServer + 'cameras',
		defaults: {
			framerate: 1,
			isOn: false
		},
		parse: function(response) {
			console.log(response);
			response.bookmarks = JSON.parse(response.bookmarks);

			return response;
		},
		initialize: function() {
			var _this = this;

			_.bindAll(this);

			Telepresence.socket.on('change:' + this.get('id'), this.fetch);

			Telepresence.socket.on('streamEnded:' + this.get('id'), function(id) {
				_this.set('isOn', false);
			});
		},
        center: function(left, top, width, height) {
            $.ajax({
                type: 'PUT',
                url: Telepresence.nodeServer + 'cameras/' + this.get('id') + '/center',
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
        goToBookmark: function(location) {
			var pos = this.get('bookmarks')[location].position;

			this.set({
				'tilt': pos.v,
				'pan': pos.h
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