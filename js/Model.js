/**
 --------------------------------------------------------------------
      Nees Telepresence -- App Data  
 --------------------------------------------------------------------
 ********************************************************************
 --------------------------------------------------------------------
                Contents          
 --------------------------------------------------------------------
 1. Models
   a. Menus
     - SiteModel (sites in menu)
     - SiteViewModel (site views in menu)
   b. Feed
     - FeedModel (feed data -- urls for accessing feed)
     - FrameRateModel ()
   c. Camera
     - Robot (handles interaction between client and camera controls)
 2. Collections
   a. Sites
     - SiteCollection
     - SiteViewCollection
 ********************************************************************/

var app = window.app || (window.app = {});

(function($) {

  'use strict';
  app.Model ={};
  
  // Site Locations -- rendered in list or map
  var SiteModel = Backbone.Model.extend({
    defaults: {
      'loc': 'Garner Valley Downhole Array',
      'id': 0
    }
  });

  // Site Location Views
  var SiteViewModel = Backbone.Model.extend({
    defaults: {
      'title' : 'Full-Size',
      'loc'   : 'Garner Valley SFSI Field Site',
      'type'  : 'Full-Size',
      'site_id' : 1
    }
  });

  // Holds current feed data (urls to access various feed types -- eg. moving, paused)
  var FeedModel = Backbone.Model.extend({
    listen: function() {
      this.listenTo(this, 'change:type', this.updateFeed);
      this.listenTo(this, 'change:loc', this.updateFeed);
      this.listenTo(app.Model.FrameRate, 'change:value', this.getFeed);
    },
    defaults: {
      'type'   : 'Full-Size',
      'loc'    : 'Garner Vallye SFSI Field Site',
      'baseUrl': 'http://tpm.nees.ucsb.edu/feeds/'
    },
    // update requestAddress with location/view of current selection
    updateFeed: function() {
      this.set('uri', this.get('loc') + '/' + this.get('type'));
      this.set('requestAddr', this.get('baseUrl') + this.get('uri'));
      if($.browser.msie) {
        this.ieFeedShim();
      } else {
        this.getFeed();
      }
    },
    ieFeedShim: function() {
      var that = this,
          fr = app.Model.FrameRate.get('value'),
          valFr = 1000;
      switch(fr) {
        case 0:
          that.set('fullRequest', that.get('requestAddr') + '/jpeg?reset=' + Math.random());
          break;
        case 10:
          valFr = 1000;
          break;
        case 9:
          valFr = 2000;
          break;
        case 8:
          valFr = 3000;
          break;
        case 7:
          valFr = 4000;
          break;
        case 6:
          valFr = 5000;
          break;
        case 5:
          valFr = 6000;
          break;
        case 4:
          valFr = 7000;
          break;
        case 3:
          valFr = 8000;
          break;
        case 2:
          valFr = 9000;
          break;
        case 1:
          valFr = 10000;
          break;
        default:
          break;
      }
      if(fr != 0) {
        // Refresh image at interval by resetting the fullRequest address with a random number appended to it to trigger change.
        this.intervalId = setInterval(function() {
          if(app.Model.FrameRate.get('value') != 0) {
            that.set('fullRequest', that.get('requestAddr') + '/jpeg?reset=' + Math.random()); 
          } else {
            clearInterval(that.intervalId);
          }
        }, valFr);
      }
    },
    getFeed: function() {
      if(app.Model.FrameRate.get('value') == 0) {
        this._pause();
      } else {
        this._play();
      }
    },
    // Begins process of loading jpeg
    _pause: function() {
      this.set('_type','jpeg');
      this.set('fullRequest', this.get('requestAddr') + '/' + this.get('_type'));
    },
    // Begins process of loading mjpeg with framerate from FrameRateModel
    _play: function() {
      this.set('_type','mjpeg' + '/' + app.Model.FrameRate.get('value'));
      this.set('fullRequest', this.get('requestAddr') + '/' + this.get('_type'));
    },
    updateFramerate: function(f){
      var v = f.get('value');
      if(v > 0) {
        this.render('mjpeg');
        this.playerControls.toggleDisplay('play');
      } else {
        this.render('jpeg');
        this.playerControls.toggleDisplay('pause');
      }
    }
  });
  app.Model.Feed = new FeedModel;

  // Holds current framerate for camera feed
  var FrameRateModel = Backbone.Model.extend({
    defaults: {
      'value': 6, // Initial value on framerate slider
      'max'  : 10 // Max on framerate slider
    }
  });
  app.Model.FrameRate = new FrameRateModel;
  
  
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
    }
  });
  app.Model.Robot = new Robot;

  /*************************************
  *   COLLECTIONS
  **************************************/

  var SiteCollection = Backbone.Collection.extend({
    model: SiteModel,
    // Load site locations from app.Settings.
    getSettings: function () {
      var sites = [];
      for(var i in app.Settings.locations) {
        sites.push(new SiteModel(app.Settings.locations[i]));
      }
      // Reset sites.
      this.reset(sites);
    }
  });
  app.Model.Sites = new SiteCollection();

  var SiteViewCollection = Backbone.Collection.extend({
    model: SiteViewModel,
    // Load site views from app.Settings -- set when site is chosen or updated.
    updateViewsList: function (siteId) {
      var newViews = [];
      for(var i in app.Settings.views) {
        // Grab views that are associated with site location by site_id property.
        if(app.Settings.views[i].site_id == siteId) {
          newViews.push(new SiteViewModel(app.Settings.views[i]));
        }
      }
      // Reset the SiteViewCollection with new set of views.
      this.reset(newViews);
    }
  });
  app.Model.SiteViews = new SiteViewCollection();

})(jQuery);