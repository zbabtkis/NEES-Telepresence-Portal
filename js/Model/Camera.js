define([
    'Model/FrameRate'
  , 'app.settings'
  , 'underscore'
  , 'backbone'], 

  function(FrameRate, settings) {
	var Camera,
      $ = jQuery;

  Camera = Backbone.Model.extend({
		defaults: {
          'baseUrl': Drupal.settings.flex_api
        },
    initialize: function() {
			var feed = this.get('baseUrl') + this.get('site_name') + '/' + this.get('camera_name'),
          that = this;

      _.bindAll(this);

			this.set('feed', feed);
      this.set('robotic', feed + '/robotic');

			FrameRate.on('change:value', this.loadMedia);
		},
    _polyfill: function() {
      var that = this,
          fr = FrameRate.get('value'),
          valFr = 1000;

      if(fr != 0 && fr <= 10) {
        var valFr = (11 - fr) * 1000;
      } else {
        this.set('media', this.get('feed') + '/jpeg?reset=' + Math.random());
        return 0;
      }
      
      // Refresh image at interval by resetting the fullRequest address with a random number appended to it to trigger change.
      this.intervalId = setInterval(function() {
        if(FrameRate.get('value') != 0) {
          that.set('media', that.get('feed') + '/jpeg?reset=' + Math.random()); 
        } else {
          clearInterval(that.intervalId);
        }
      }, valFr);

      return this;
    },
    loadMedia: function() {
      var fr = FrameRate.get('value');

      // Break and use polyfill if browser doesn't support mjpeg.
      if($.browser.msie && $.browser.version < 10.0) {
        this._polyfill();

        return this;
      }

      if(fr == 0) {
        this.set('media', this.get('feed') + '/' + 'jpeg');
      } else {
        this.set('media', this.get('feed') + '/mjpeg/' + fr);
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
    _home: function() {
      var that = this;
      $.ajax({
        url: that.get('robotic'),
        data: {'ctrl': 'home'},
        dataType: 'jsonp'
      });
      return this;
    },
    _screenshot: function() {
      var loc = this.get('feed') + '/jpeg?attachment=true';
      window.location.href = loc;
    },
    _position: function(args) {
      var that, actions = [], action, pan, tilt, i;

      that = this;
      actions['pan'] = "?ctrl=apan&amp;imagewidth=" + args.imgWidth + "&amp;value=?" + args.width;
      actions['tilt'] = "?ctrl=atilt&amp;imageheight=" + args.imgHeight + "&amp;value=?" + args.height;
      for(action in actions) {
        $.ajax({
          url: that.get('robotic') + actions[action],
          dataType: 'jsonp'
        });
      }
    },
    _panTo: function(val) {
      var that = this,
        val = val + ',13';

      $.ajax({
        url: that.get('robotic'),
        data: 'ctrl=apan&amp;imagewidth=100&amp;value=?' + val,
        dataProcess: false,
        dataType: 'jsonp'
      });
    },
    _tiltTo: function(val) {
      var that = this,
        // Tilting is inverted
        val = '13,' + (100 - val);

      $.ajax({
        url: that.get('robotic'),
        data: 'ctrl=atilt&amp;imageheight=100&amp;value=?' + val,
        dataProcess: false,
        dataType: 'jsonp'
      });
    },
    _zoomTo: function(val) {
      var that = this,
        // Offset negative zoom
        val = (10 + val) + ',13';

      $.ajax({
        url: that.get('robotic'),
        data: 'ctrl=azoom&amp;imagewidth=20&amp;value=?' + val,
        dataProcess: false,
        dataType: 'jsonp'
      });
    },
    _focusTo: function(val) {
      var _this = this,
        val = (10 + val) + ',9';

        $.ajax({
          url: _this.get('robotic'),
          data: 'ctrl=afocus&amp;imagewidth=20&amp;value=?' + val,
          dataProcess: false,
          dataType: 'jsonp'
        });
    },
	});

	return Camera;
});