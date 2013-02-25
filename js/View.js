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
 ********************************************************************/

var app = window.app || (window.app = {});

(function($, Backbone, _) {

	'use strict';
	app.View = {};

	var MapView = Backbone.View.extend({
		el: "#map-view",
		render: function() {
			var that = this;
	    	this.$el.gmap3({
	    		map: app.Settings.map,
	    		marker: {
	    			values: app.Model.Sites,
	    			events: {
		    			mouseover: function(marker, event, context){
					        var map = $(this).gmap3("get"),
					        	infowindow = $(this).gmap3({get:{name:"infowindow"}});
					        if (infowindow){
					        	infowindow.open(map, marker);
					        	infowindow.setContent(context.get('loc'));
					        } else {
					          	$(this).gmap3({
					          		infowindow:{
					            		anchor:marker, 
					              		options:{content: context.get('loc')}
					            	}
					          	});
					        }
				      	},
				      	mouseout: function(){
					    	var infowindow = $(this).gmap3({get:{name:"infowindow"}});
					    	if (infowindow){
					          infowindow.close();
					        }
					    },
				    	click: function(marker, event, context) {
				    		that.trigger('site-opened',context.loc);
				      	}
		    		}
	    		}
	    	});
	    	this.$el.show();
	    },
	});

	var StreamView = Backbone.View.extend({
		el: '#stream',
		render: function() {
			var that = this;
			app.View.FeedImage.$el.load(function() {
				that.$el.html('');
				//that.stream.$el.prepend(app.View.CameraControlView.$el);
				that.$el.append(app.View.FeedImage.$el);
				//that.stream.$el.append(app.View.PlayerControlView.$el);
			});
		},
		listen: function() {
			this.listenTo(app.View.FeedImage, 'newStreamInitialized', this.render);
		}
	});

	/** Displays the current feed buffer or image. */
	var FeedImage = Backbone.View.extend({
		tagName: 'img',
		class: 'feed-image',
		listen: function() {
			this.listenTo(app.Model.Feed, 'change:fullRequest', this.change);
		},
		change: function() {
			this.$el.attr('src',app.Model.Feed.get('fullRequest'));
			this.trigger('newStreamInitialized');
		},
	});

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
			'value': 'none',
		},
		attributes: function() {
			return {
				'data-action': this.options.action,
				'data-value': this.options.value,
				'alt': this.options.title,
				'title': this.options.title,
			};
		},
	});

	/** Input elements allowing user to control the feed */
	var CameraControlView = Backbone.View.extend({
		el: '#controls',
		initialize: function() {
			//app.View.Slider.$el.addClass('framerate');
			// Adds slider to controller view.
			//this.$el.append(app.View.Slider.$el);
			// Renders camera action buttons on the controller.
			this.addCameraButtons();
		},
		addCameraButtons: function() {
			this.cameraActions = [];
			// Creates Camera Button instances for each robotic action.
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
			'click .camera-action': 'doCameraAction',
		},
		doCameraAction: function(e) {
			var action = e.currentTarget.dataset.action;
			var value = e.currentTarget.dataset.value;
			// Tells the Robot to perform camera action.
			app.Model.Robot.robotCommand(action,value);
		}
	});

	/** $ slider taht controls framerate */
	var SliderView = Backbone.View.extend({
		tagName: 'div',
		className: 'slider',
		initialize: function() {
			this.$el.slider({
				max: app.Model.FrameRate.get('max'),
				value: app.Model.FrameRate.get('value'),
				change: function(ob, fr) {
					app.Model.FrameRate.set({'value':fr});
				},
				slide: function(ob, fr) {
					that.trigger('framerate-sliding', fr.value);
				}
			});
			// $ slider handle selector to append framerate value to.
			this.$handle = this.$el.find('.ui-slider-handle');
		},
		renderSlideValue: function(v) {
			// Insert text displaying current slider framerate selection.
			this.$handle.append(app.Model.FrameRate.get('value'));
		},
		listen: function() {
			this.on('framerate-sliding', this.renderSlideValue);
		}
	});

	/** Allows user to play and pause feed -- might take this out to avoid conflicts with slider/user confusion */
	var PlayerControlView = new Backbone.View.extend({
		tagName: 'div',
		attributes: function() {
			return {
				'id': 'player-controls',
			};
		},
		initialize: function() {
			this.play = new PlayButton();
			this.$el.append(this.play.$el);
		},
		events: {
			'click .play-pause': 'playPause',
		},
		playPause: function() {
			this.play.playPause();
		},
		// Shortcut for displayToggle method on play button.
		toggleDisplay: function(val) {
			this.play.toggleDisplay(val);
		},
	});
	app.View.PlayerControl = PlayerControlView;

	/** Button that toggles play/pause on feed */
	var PlayButton = Backbone.View.extend({
		tagName: 'button',
		className: 'play-pause',
		attributes: function() {
			return {
				'data-control-option': 'play',
			};
		},
		initialize: function() {
			this.$el.html('||');
		},
		playPause: function(val) {
			this.state = this.state || 'play';
			if(this.state === 'play') {
				this.$el.html('>');
				this.state = 'pause';
				this.trigger('playerPaused');
			} else  {
				this.$el.html('||');
				this.state = 'play';
				this.trigger('playerPlayed');
			}
		},
		toggleDisplay: function(val) {
			if(val === 'play') {
				this.$el.html('||');
				this.state = 'play';
			} else  {
				this.$el.html('>');
				this.state = 'pause';
			}
		},
	});

	// List of each available site -- alternative to map view. */
	var SiteListView = Backbone.View.extend({
		el: '#sites',
		render: function() {
			this.$el.html('');
			self = this;
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
		},
	});

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
			'click li': 'openFeed',
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
			
	var MenuElement = Backbone.View.extend({
			tagName: 'li',
			className: 'feed-link',
			attributes: function(){
				return {
					'data-loc': this.options.menu.attributes['loc'],
					'data-type': this.options.menu.attributes['type'],
				};
			},
			initialize: function() {
				var self = this;
				var title = this.options.menu.attributes['title'];
				this.$el.html(title);
			}
	});
	app.View.MenuElement =  MenuElement;

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
			},
	});
	app.View.SiteElement = SiteElement;

	var Menu = Backbone.View.extend({
		el: '#options-menu',
		events: {
			'click #listMaker':'addList',
			'click #mapMaker':'renderMap',
		},
		addList: function() {
			app.Router.navigate('sites', {trigger: true});
		},
		renderMap: function() {
			app.Router.navigate('map',{trigger: true});
		},
	});
	// Ensure template has loaded before trying to attach selectors.
	$(document).ready( function() {
		app.View.Map = new MapView;
		app.View.Stream = new StreamView;
		app.View.FeedImage = new FeedImage;
		app.View.CameraControl = new CameraControlView;
		app.View.Slider = new SliderView();
		app.View.SiteList = new SiteListView();
		app.View.MenuList = new MenuListView;
		app.View.Menu = new Menu;
		app.trigger('viewsRendered');
	});
})(jQuery, Backbone, _);