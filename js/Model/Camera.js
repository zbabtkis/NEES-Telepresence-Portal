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
          'baseUrl': settings.baseURL
        },
    initialize: function() {
			var feed = this.get('baseUrl') + this.get('loc') + '/' + this.get('type'),
          that = this;

			this.set('feed', feed);
      this.set('robotic', feed + '/robotic');

      _.bindAll(this);

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
    action: function(action) {
      this['_' + action];
    },
    _iris: function(value) {
      var that  = this,
        actions = ['close', 'open', 'auto']; // Only accept these actions
      if($.inArray(value, actions)) {
        if(value == 'close' || value == 'open') { var pre = 'r' } else { var pre = ''}; // Non automatic commands (i.e. close and auto) must be prefixed by 'r' in the GET action.
        $.ajax({
          url: that.get('robotic'),
          data: {'ctrl': pre + 'iris', 'value': value}, // Format should be http://tps.nees.ucsb.edu/path/to/site/view/robot?ctrl=[action]&value=[value]
          dataType: 'jsonp' // We don't need a returned value for now, and this will allow Cross-Domain HTTPRequest until we add CORS header to robotic script.
        });
      }
    },
    _focus: function(value) {
      var that  = this,
        actions = ['near', 'far', 'auto'];
      if($.inArray(value, actions)) {
        if(value == 'near' || value == 'far') { var pre = 'r' } else { var pre = ''};
        $.ajax({
          url: that.get('robotic'),
          data: {'ctrl': pre + 'focus', 'value': value},
          dataType: 'jsonp'
        });
        return this;
      } else {
        
      }
    },
    _zoom: function(value) {
      var that  = this,
        actions = ['in', 'out'];
      if($.inArray(value, actions)) {
        $.ajax({
          url: that.get('robotic'),
          data: {ctrl: 'rzoom', value: value},
          dataType: 'jsonp'
        });
        return this;
      } else {
        
      }
    },
    _tilt: function(value) {
      var that  = this,
        actions = ['up', 'down'];
      if($.inArray(value, actions)) {
        $.ajax({
          url: that.get('robotic'),
          data: {'ctrl': 'rtilt', 'value': value},
          dataType: 'jsonp'
        });
        return this;
      } else {
        
      }
    },
    _pan: function(value) {
      var that  = this,
        actions = ['right', 'left'];
      $.ajax({
        url: that.get('robotic'),
        data: {'ctrl': 'rpan', 'value': value},
        dataType: 'jsonp'
      });
      return this;
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
    }
	});

	return Camera;
});