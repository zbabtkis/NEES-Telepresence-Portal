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

(function() {

	'use strict';
	app.Model ={};
	
	// Site Locations -- rendered in list or map
	var SiteModel = Backbone.Model.extend({
		defaults: {
			'loc': 'Garner Valley Downhole Array',
			'id': 0,
		}
	});

	// Site Location Views
	var SiteViewModel = Backbone.Model.extend({
		defaults: {
			'title' : 'Full-Size',
			'loc'   : 'Garner Valley SFSI Field Site',
			'type'  : 'Full-Size',
			'site_id' : 1,
		},
	});

	// Holds current feed data (urls to access various feed types -- eg. moving, paused)
	var FeedModel = Backbone.Model.extend({
		listen: function() {
			this.on('change:type', this.updateFeed);
			this.on('change:loc', this.updateFeed);
			this.listenTo(app.Model.FrameRate, 'change:value', this.getFeed);
		},
		defaults: {
			'baseUrl': 'http://tpm.nees.ucsb.edu/feeds/',
		},
		// update requestAddress with location/view of current selection
		updateFeed: function() {
			this.set('uri', this.get('loc') + '/' + this.get('type'));
			this.set('requestAddr', this.get('baseUrl') + this.get('uri'));
			this.getFeed();
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
			this._render();
		},
		// Begins process of loading mjpeg with framerate from FrameRateModel
		_play: function() {
			var fr = app.Model.FrameRate.get('value');
			this.set('_type','mjpeg' + '/' + fr);
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
		},
		// Listen to play, pause clicks from PlayerController
		addListeners: function() {
			// Play Pause listeners.
			this.listenTo(this.playerControls.play, 'playerPaused', this.__pause);
			this.listenTo(this.playerControls.play, 'playerPlayed', this.__play);
		},
	});
	app.Model.Feed = new FeedModel;

	// Holds current framerate for camera feed
	var FrameRateModel = Backbone.Model.extend({
		defaults: {
			'value': 6, // Initial value on framerate slider
			'max'  : 10, // Max on framerate slider
		}
	});
	app.Model.FrameRate = new FrameRateModel;
	
	
	// Handles Robotic Actions
	var Robot = Backbone.Model.extend({
		defaults: {
			'lastCall': null, // Not in use now, but we might want to have some sort of undo function.
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
			var that 	= this,
				actions = ['close', 'open', 'auto']; // Only accept these actions
			if(actions.indexOf(value) != -1) {
				if(value == 'close' || value == 'open') { var pre = 'r' } else { var pre = ''}; // Non automatic commands (i.e. close and auto) must be prefixed by 'r' in the GET action.
				jQuery.ajax({
					url: that.get('handler'),
					data: {'ctrl': pre + 'iris', 'value': value}, // Format should be http://tps.nees.ucsb.edu/path/to/site/view/robot?ctrl=[action]&value=[value]
					dataType: 'jsonp', // We don't need a returned value for now, and this will allow Cross-Domain HTTPRequest until we add CORS header to robotic script.
					complete: function() {
						console.log('iris ' + value + ' complete.');
					},
				});
				return this;
			} else {
				console.log('invalid iris action given.');
			}
		},
		_focus: function(value) {
			var that 	= this,
				actions = ['near', 'far', 'auto'];
			if(actions.indexOf(value) != -1) {
				if(value == 'near' || value == 'far') { var pre = 'r' } else { var pre = ''};
				jQuery.ajax({
					url: that.get('handler'),
					data: {'ctrl': pre + 'focus', 'value': value},
					dataType: 'jsonp',
					complete: function() {
						console.log('focus ' + value + ' complete.');
					},
				});
				return this;
			} else {
				console.log('invalid focus action given.');
			}
		},
		_zoom: function(value) {
			var that 	= this,
				actions = ['in', 'out'];
			if(actions.indexOf(value) != -1) {
				jQuery.ajax({
					url: that.get('handler'),
					data: {ctrl: 'rzoom', value: value},
					dataType: 'jsonp',
					complete: function() {
						console.log('zoom ' + value + ' complete.');
					},
				});
				return this;
			} else {
				console.log('invalid zoom action given.');
			}
		},
		_tilt: function(value) {
			var that 	= this,
				actions = ['up', 'down'];
			if(actions.indexOf(value) != -1) {
				jQuery.ajax({
					url: that.get('handler'),
					data: {'ctrl': 'rtilt', 'value': value},
					dataType: 'jsonp',
					complete: function() {
						console.log('tilt ' + value + ' complete.');
					},
				});
				return this;
			} else {
				console.log('invalid tilt action given.');
			}
		},
		_pan: function(value) {
			var that 	= this,
				actions = ['right', 'left'];
			jQuery.ajax({
				url: that.get('handler'),
				data: {'ctrl': 'rpan', 'value': value},
				dataType: 'jsonp',
				complete: function() {
					console.log('pan ' + value + ' complete.');
				},
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
					console.log('home centering complete.');
				},
			});
			return this;
		},
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
		},
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

})();