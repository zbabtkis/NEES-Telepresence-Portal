define(['underscore', 'backbone'], function() {
  // Handles Robotic Actions
  var Robot = Backbone.Model.extend({
    defaults: {
      'lastCall': null // Not in use now, but we might want to have some sort of undo function.
    },
    // Add listener for changes in the FeedModel's requestAddress
    initialize: function() {
      this.listenTo(app.Model.Feed, 'change:requestAddr', this.updateRobotHandler)
    },
    updateRobotHandler: function() {
      this.set('handler', app.Model.Feed.get('requestAddr') + '/robotic')
    },
    robotCommand: function(method, value) {
      // Calls private action handlers -- this will allow us to validate data before performing action.
      this['_' + method](value);
    },
    validateRoboticCommand: function() {
      // @TODO validate action request from robotCommand method.
    },
    _iris: function(value) {
      var that  = this,
        actions = ['close', 'open', 'auto']; // Only accept these actions
      if(actions.indexOf(value) != -1) {
        if(value == 'close' || value == 'open') { var pre = 'r' } else { var pre = ''}; // Non automatic commands (i.e. close and auto) must be prefixed by 'r' in the GET action.
        jQuery.ajax({
          url: that.get('handler'),
          data: {'ctrl': pre + 'iris', 'value': value}, // Format should be http://tps.nees.ucsb.edu/path/to/site/view/robot?ctrl=[action]&value=[value]
          dataType: 'jsonp', // We don't need a returned value for now, and this will allow Cross-Domain HTTPRequest until we add CORS header to robotic script.
          complete: function() {
            
          }
        });
        return this;
      } else {
        
      }
    },
    _focus: function(value) {
      var that  = this,
        actions = ['near', 'far', 'auto'];
      if(actions.indexOf(value) != -1) {
        if(value == 'near' || value == 'far') { var pre = 'r' } else { var pre = ''};
        jQuery.ajax({
          url: that.get('handler'),
          data: {'ctrl': pre + 'focus', 'value': value},
          dataType: 'jsonp',
          complete: function() {
            
          }
        });
        return this;
      } else {
        
      }
    },
    _zoom: function(value) {
      var that  = this,
        actions = ['in', 'out'];
      if(actions.indexOf(value) != -1) {
        jQuery.ajax({
          url: that.get('handler'),
          data: {ctrl: 'rzoom', value: value},
          dataType: 'jsonp',
          complete: function() {
            
          }
        });
        return this;
      } else {
        
      }
    },
    _tilt: function(value) {
      var that  = this,
        actions = ['up', 'down'];
      if(actions.indexOf(value) != -1) {
        jQuery.ajax({
          url: that.get('handler'),
          data: {'ctrl': 'rtilt', 'value': value},
          dataType: 'jsonp',
          complete: function() {
            
          }
        });
        return this;
      } else {
        
      }
    },
    _pan: function(value) {
      var that  = this,
        actions = ['right', 'left'];
      jQuery.ajax({
        url: that.get('handler'),
        data: {'ctrl': 'rpan', 'value': value},
        dataType: 'jsonp',
        complete: function() {
          
        }
      });
      return this;
    },
    _refresh: function() {
      var currentRequest = app.Model.Feed.get('fullRequest');
      var time = '?timestamp=' + Date.now();
      // Allow view to detect change in feed by appending current time to url.
      app.Model.Feed.set('fullRequest', currentRequest + time);
    },
    _home: function() {
      var that = this;
      jQuery.ajax({
        url: that.get('handler'),
        data: {'ctrl': 'home'},
        dataType: 'jsonp',
        complete: function() {
          
        }
      });
      return this;
    },
    _screenshot: function() {
      var loc = app.Model.Feed.get('requestAddr') + '/jpeg?attachment=true';
      window.location.href=loc;
    },
    _position: function(args) {
      var that, actions = [], action, pan, tilt, i;

      that = this;
      actions['pan'] = "?ctrl=apan&amp;imagewidth=" + args.imgWidth + "&amp;value=?" + args.width;
      actions['tilt'] = "?ctrl=atilt&amp;imageheight=" + args.imgHeight + "&amp;value=?" + args.height;
      for(action in actions) {
        $.ajax({
          url: that.get('handler') + actions[action],
          dataType: 'jsonp',
          complete: function() {
              
          }
        });
      }
    }
  });

  return {
    initialize: function() {
      var robot = new Robot();

      this.robotCommand = robot.robotCommand;
    }
  };
});