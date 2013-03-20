/**
 --------------------------------------------------------------------
      Nees Telepresence -- App Views 
 --------------------------------------------------------------------
 ********************************************************************
 --------------------------------------------------------------------
                Contents          
 --------------------------------------------------------------------
 1. Views 
   a. MapView (google maps)
     - map
     - markers
   b. StreamView (wrapper for current stream)
   c. FeedImage
   d. CameraButtonView
   e. CameraControlView
   f. SliderView
   g. PlayerControlViwe
   h. PlayButton
   i. SiteListView
   j. MenuListView
   k. MenuElement
   l. SiteElement
   m. Menu
 2. Actions
   a. document ready
	 - instantiate views
	 - dispatch viewsRendered event
 --------------------------------------------------------------------
                Uses          
 --------------------------------------------------------------------
 1. jQuery
 2. Backbone
 3. Underscore
 ********************************************************************/

var app = window.app || (window.app = {});

(function($, Backbone, _) {

	'use strict';
	app.View = {};
/** 1) -- Views
    ..a) Map View */
	var MapView = Backbone.View.extend({
		el: "#map-view",
		render: function() {
			var that = this;
			this.markers = [];
			// Instantiate google map.
	    	this.map = new google.maps.Map(this.el, app.Settings.map.options);
	    	// Add site markers to map.
	    	app.Model.Sites.forEach(function(site) {
	    		that.markers.push(new google.maps.Marker({
	    			position: site.get('position'),
	    			map: that.map,
	    			site_id: site.get('site_id'),
	    			title: site.get('loc')
	    		}));
	    	});
	    	// Add listeners to markers.
	    	for(i in this.markers) {
	    		this.markers[i].infowindow = new google.maps.InfoWindow({
		    		content: this.markers[i].title,
		    		maxWidth: 50
		    	});
	    		google.maps.event.addListener(this.markers[i], 'click', function() {
	    			app.Router.navigate('map/' + this.site_id, {trigger: true});
	    		});
	    		google.maps.event.addListener(this.markers[i], 'mouseover', function() {
	    			this.infowindow.open(that.map, this);
	    		});
	    		google.maps.event.addListener(this.markers[i], 'mouseout', function() {
	    			this.infowindow.close(that.map, this);
	    		});
	    	}
	    }
	});
/**..b) StreamView */
	var StreamView = Backbone.View.extend({
		el: '#stream',
		initialize: function() {
			// Awesome spinny preloader provided by spin.js :).
			this.spinner = new Spinner({
				color:'#eee',
			}).spin(this.$el);
			// Position spinner in center of video feed.
			this.$spinner = $(this.spinner.el);
			this.$spinner.css({
				'top':'50%',
				'left': '50%',
				'position': 'absolute',
				'z-index': '999999999999999999'
			});
			this.translucent = $('<div />').addClass('transparentBox').hide();
		},
		render: function() {
			var that = this;
			// Check for images loaded before appending.
			app.View.FeedImage.$el.imagesLoaded(function() {
				that.$el.html('');
				// Append new stream image to view.
				that.$el.append(app.View.FeedImage.$el);
				// Remove any default backgrounds.
				that.$el.css({'background': 'none'});
				// Resize wrapper to match image size.
				that.resize();
				that.$el.append(that.translucent);
				if(!app.enableActions) {
					that.enableActions();
					app.enableActions = true;
				}
			});
		},
		enableActions: function() {
			app.View.Play.enable();
			app.View.FullScreenButton.enable();
			app.View.Slider.enable();
		},
		fullScreen: function() {
			$('.transparentBox').toggle();
			app.View.FeedImage.$el.toggleClass('fullScreen');
			$('#player-controls').toggleClass('fullScreenControls');
		},
		listen: function() {
			var that = this;
			_.bindAll(this, 'resize');
			// Resize for responsive design.
			$(window).resize(that.resize);
			this.listenTo(app.View.FeedImage, 'newStreamInitialized', that.render);
			app.Model.Feed.on('change:fullRequest', function() {
				this.$el.append(this.$spinner);
			}.bind(this));
			this.listenTo(app.View.FullScreenButton, 'fullScreen', this.fullScreen, this);
		},
		resize: function() {
			if(app.View.FeedImage.$el.height()) {
				this.$el.css({'height':app.View.FeedImage.$el.height()});
			}
		}
	});
/**..c) FeedImage */
	/** Displays the current feed buffer or image. */
	var FeedImage = Backbone.View.extend({
		tagName: 'img',
		className: 'feed-image',
		listen: function() {
			var that = this;
			// Change feed source when new source has been loaded into model.
			this.listenTo(app.Model.Feed, 'change:fullRequest', that.change);
		},
		change: function() {
			this.$el.attr('src',app.Model.Feed.get('fullRequest')).error(function() {
				$(this).attr('src', '/' + Drupal.settings.modulePath + '/css/img/stream-unavailable.jpg');
			});
			this.trigger('newStreamInitialized');
		}
	});
/**..d) CameraButtonView */
	/** Button linking to a robotic action */
	var CameraButtonView = Backbone.View.extend({
		tagName: 'button',
		className: function() {
			var value = this.options.value?this.options.value:'action';
			return 'camera-action ' + this.options.action + '-' + value;
		},
		defaults: {
			'title': 'Camera Action',
			'action': 'none',
			'value': 'none'
		},
		// Semantic robotic commands.
		attributes: function() {
			return {
				'data-action': this.options.action,
				'data-value': this.options.value,
				'alt': this.options.title,
				'title': this.options.title
			};
		}
	});
/**..e) CameraControlView */
	/** Input elements allowing user to control the feed */
	var CameraControlView = Backbone.View.extend({
		el: '#controls',
		initialize: function() {
			this.addCameraButtons();
		},
		addCameraButtons: function() {
			this.cameraActions = [];
			// Creates Camera Button instances for each robotic action.
			this.cameraActions['screenshot'] = new CameraButtonView({'title': 'Screenshot', 'action': 'screenshot'});
			this.cameraActions['zoomIn'] = new CameraButtonView({'title': 'Zoom In', 'action': 'zoom', 'value': 'in'});
			this.cameraActions['zoomOut'] = new CameraButtonView({'title': 'Zoom Out', 'action': 'zoom', 'value': 'out'});
			this.cameraActions['panLeft'] = new CameraButtonView({'title': 'Pan Left', 'action': 'pan', 'value': 'left'});
			this.cameraActions['panRight'] = new CameraButtonView({'title': 'Pan Right', 'action': 'pan', 'value': 'right'});
			this.cameraActions['tiltUp'] = new CameraButtonView({'title': 'Tilt Up', 'action': 'tilt', 'value': 'up'});
			this.cameraActions['tiltDown'] = new CameraButtonView({'title': 'Tilt Down', 'action': 'tilt', 'value': 'down'});
			this.cameraActions['irisOpen'] = new CameraButtonView({'title': 'Iris Open', 'action': 'iris', 'value': 'open'});
			this.cameraActions['irisClose'] = new CameraButtonView({'title': 'Iris Close', 'action': 'iris', 'value': 'close'});
			this.cameraActions['irisAuto'] = new CameraButtonView({'title': 'Iris Auto', 'action': 'iris', 'value': 'auto'});
			this.cameraActions['focusNear'] = new CameraButtonView({'title': 'Focus Near', 'action': 'focus', 'value': 'near'});
			this.cameraActions['focusFar'] = new CameraButtonView({'title': 'Focus Far', 'action': 'focus', 'value': 'far'});
			this.cameraActions['focusAuto'] = new CameraButtonView({'title': 'Autofocus', 'action': 'focus', 'value': 'auto'});
			this.cameraActions['home'] = new CameraButtonView({'title': 'Home', 'action': 'home'});
			for(var action in this.cameraActions) {
				// Appends elements to Control View.
				var $el = this.cameraActions[action].$el;
				this.$el.append($el);
			}
		},
		events: {
			'click .camera-action': 'doCameraAction'
		},
		doCameraAction: function(e) {
			var action = e.currentTarget.dataset.action;
			var value = e.currentTarget.dataset.value;
			// Tells the Robot to perform camera action.
			app.Model.Robot.robotCommand(action,value);
		}
	});
/**..f) SliderView */
	/** $ slider taht controls framerate */
	var SliderView = Backbone.View.extend({
		tagName: 'div',
		className: 'slider',
		enable: function () {
			var that = this;
			this.$el.slider({
				max: app.Model.FrameRate.get('max'),
				value: app.Model.FrameRate.get('value'),
				change: function (ob, fr) {
					app.Model.FrameRate.set({'value':fr.value});
					that.trigger('sliderChanged', fr.value);
				},
				slide: function (ob, fr) {
					that.trigger('sliderChanged', fr.value);
				}
			});
			// $ slider handle selector to append framerate value to.
			this.$handle = this.$el.find('.ui-slider-handle');
			this.renderSlideValue(app.Model.FrameRate.get('value'));
			$('#slider').append(this.$el);
		},
		renderSlideValue: function (v) {
			this.$handle.html('');
			var fr = v;
			// Insert text displaying current slider framerate selection.
			this.$handle.append('Framerate:');
			this.$handle.append(fr);
		},
		listen: function () {
			this.on('sliderChanged', this.renderSlideValue);
			app.Model.FrameRate.on('change:value', function () {
				this.$el.slider('value', app.Model.FrameRate.get('value'));
			}, this);
		}
	});
/**..g) PlayButton */
	/** Button that toggles play/pause on feed */
	var PlayButton = Backbone.View.extend({
		tagName: 'button',
		className: 'play-pause',
		attributes: function() {
			return {
				'data-control-option': 'play'
			};
		},
		initialize: function() {
			this.$parent = $('#player-controls');
		},
		enable: function() {
			this.$parent.append(this.$el);
			this.$el.click(this.playPause);
		},
		playPause: function() {
			// Check current state and change it.
			if(app.Model.FrameRate.get('value') != '0') {
				app.Model.FrameRate.set('value', 0);
			} else  {
				app.Model.FrameRate.set('value', 5);
			}
		},
		listen: function() {
			// Listen for change in framerate -- this could mean video has paused if fr is 0!
			app.Model.FrameRate.on('change:value', this.updateButton, this);
		},
		updateButton: function() {
			// If framerate slider changes from play to pause, only render change for button.
			this.$el.toggleClass('play');
		}
	});
/**..h) SiteListView */
	// List of each available site -- alternative to map view. */
	var SiteListView = Backbone.View.extend({
		el: '#sites',
		render: function() {
			this.$el.html('');
			var self = this;
			// Create menu list for each site and append it to the view.
			app.Model.Sites.forEach(function(item) {
				var newMenu = new SiteElement({menu:item});
				self.$el.append(newMenu.$el);
			});
			this.$el.show();
		},
		events: {
			'click li':'openSite'
		},
		openSite: function(e) {
			var siteId = $(e.target).data('siteId');
			app.Router.navigate('sites/' + siteId, {trigger: true});
		}
	});
/**..i) MenuListView */
	var MenuListView = Backbone.View.extend({
		el: '#sub-menu',
		render: function() {
			this.$el.html('');
			var that = this;
			app.Model.SiteViews.forEach(function(item) {
				var newMenu = new MenuElement({menu:item});
				that.$el.append(newMenu.$el);
			});
		},
		events: {
			'click li': 'openFeed'
		},
		openFeed: function(e) {
			var loc  = $(e.target).data('loc'),
				type = $(e.target).data('type');
			app.Model.Feed.set({type: type, loc: loc});
		},
		listen: function() {
			this.listenTo(app.Model.SiteViews, 'reset', this.render);
		}
	});
/**..j) MenuElement */			
	var MenuElement = Backbone.View.extend({
		tagName: 'li',
		className: 'feed-link',
		attributes: function(){
			return {
				'data-loc': this.options.menu.attributes['loc'],
				'data-type': this.options.menu.attributes['type']
			};
		},
		initialize: function() {
			var self = this;
			var title = this.options.menu.attributes['title'];
			this.$el.html(title);
		}
	});
	app.View.MenuElement =  MenuElement;
/**..k) SiteElement */
	var SiteElement = Backbone.View.extend({
		tagName: 'li',
		className: 'site-link',
		attributes: function(){
			return {
				'data-site-id': this.options.menu.attributes.site_id
			};
		},
		initialize: function() {
			var title = this.options.menu.attributes['loc'];
			this.$el.html(title);
		}
	});
	app.View.SiteElement = SiteElement;
/**..l) Menu */
	var Menu = Backbone.View.extend({
		el: '#options-menu',
		events: {
			'click #listMaker':'addList',
			'click #mapMaker':'renderMap'
		},
		addList: function() {
			app.Router.navigate('sites', {trigger: true});
		},
		renderMap: function() {
			app.Router.navigate('map',{trigger: true});
		}
	});
/**..m) Full Screen Button */
	var FullScreenButton = Backbone.View.extend({
		tagName: 'button',
		initialize: function() {
			this.$parent = $('#player-controls');
			this.$el.attr('id','fullScreenButton').addClass('camera-action');
		},
		enable: function() {
			var that = this;
			this.$el.toggle(function() {
					$(this).toggleClass('small');
					that.trigger('fullScreen');
				},
				function() {
					$(this).toggleClass('small');
					that.trigger('fullScreen');
				}
			);
			this.$parent.append(this.$el);
		}
	});
/** 2) Actions  */
	// Ensure template has loaded before trying to attach selectors.
	$(document).ready( function() {
		// Instantiate views on app.View.
		app.View.Stream = new StreamView;
		app.View.Play = new PlayButton();
		app.View.FullScreenButton = new FullScreenButton();
		app.View.FeedImage = new FeedImage;
		app.View.CameraControl = new CameraControlView;
		app.View.Slider = new SliderView();
		app.View.SiteList = new SiteListView();
		app.View.MenuList = new MenuListView;
		app.View.Menu = new Menu;
		app.View.Map = new MapView;
		app.trigger('viewsRendered');
	});
})(jQuery, Backbone, _);