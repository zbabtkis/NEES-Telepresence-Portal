/**
 --------------------------------------------------------------------
      Nees Telepresence -- App Views 
 --------------------------------------------------------------------
 ********************************************************************
 --------------------------------------------------------------------
                Contents          
 --------------------------------------------------------------------
 1. Views 
   a. InfoView (Help)
   b. StreamView (wrapper for current stream)
   c. FeedImage
   d. CameraButtonView
   e. CameraControlView
   f. AngleControlView
   g. SliderView
   h. PlayerControlViwe
   i. PlayButton
   j. SiteListView
   k. MenuListView
   l. MenuElement
   m. SiteElement
   n. Menu
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

/**..a) Info View */
	var InfoView = Backbone.View.extend({
		el: '#info-view .inner-view',
		initialize: function() {
			var header, txt;
			this.listenTo(app.Router, 'helpRequest', this.help);
			header = $("<h3 />").html('Help');
			txt = Drupal.settings.telepresence_about;
			header.appendTo(this.$el);
			this.$el.append(txt);
		},
		help: function() {
			app.View.Menu.showHelp();
		}
	});
/**..b) StreamView */
	var StreamView = Backbone.View.extend({
		el: '#stream',
		initialize: function() {
			this.addFancyElements();
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
			});
		},
		addFancyElements: function() {
			// Awesome spinny preloader provided by spin.js :).
			this.spinner = new Spinner({
				color:'#eee'
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

			this.selectAStream = $('<img />').attr({
				'src':'/' + Drupal.settings.modulePath + '/css/img/select-a-stream.jpg',
				'alt': "Select a stream",
				'title': "Select a stream",
				'class': 'image-default'
			});
			this.$el.html(this.selectAStream);
		},
		fullScreen: function() {
			// Create translucent background over app during full screen mode.
			$('.transparentBox').toggle();
			// Display player controls at bottom of screen
			$('#player-controls').toggleClass('fullScreenControls');
			// Make stream take up full window.
			app.View.FeedImage.$el.toggleClass('fullScreen');

			// Otherwise, app wrapper elongates to match bottom of image.
			this.resize();
		},
		listen: function() {
			var that = this;
			// Resize for responsive design.
			$(window).on('resize', this.resize);
			// Provides preloading image.
			this.listenTo(app.Model.Feed, 'change:fullRequest', that.loading);
			// Render when stream when new view selected
			this.listenTo(app.View.FeedImage, 'newStreamInitialized', that.render);
			// Handle full screen reuquests.
			this.listenTo(app.View.FullScreenButton, 'fullScreen', that.fullScreen);
		},
		loading: function() {
			this.$el.append(this.$spinner);
		},
		resize: function() {
			var imgSize;
			var that = this;
			if(app.View.FeedImage.$el.height()) {
				imgSize = app.View.FeedImage.$el.height();
				that.$el.css({'height': imgSize});
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
			_.bindAll(this);
			// Change feed source when new source has been loaded into model.
			this.listenTo(app.Model.Feed, 'change:fullRequest', that.change);
		},
		change: function() {
			// Change image source to new feed if image load is success -- otherwise handle feed failure.
			this.$el.attr('src',app.Model.Feed.get('fullRequest')).error(this._fail).load(this._loaded);
			this.trigger('newStreamInitialized');
		},
		_fail: function() {
			var unavailable = '/' + Drupal.settings.modulePath + '/css/img/stream-unavailable.jpg';
			this.$el.attr('src', unavailable);
			this._disableActions();
		},
		_loaded: function() {
			this._enableActions();
		},
		_enableActions: function() {
			app.View.Play.enable();
			app.View.FullScreenButton.enable();
			app.View.Slider.enable();
			app.View.CameraControl.enable();
		},
		_disableActions: function() {
			app.View.Play.disable();
			app.View.FullScreenButton.disable();
			app.View.Slider.disable();
			app.View.CameraControl.disable();
		}
	});
/**..d) CameraButtonView */
	/** Button linking to a robotic action */
	var CameraButtonView = Backbone.View.extend({
		tagName: 'button',
		className: function() {
			var value = this.options.value ? this.options.value : 'action';
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
		tagName: 'div',
		attributes: function() {
			return {
				'id':'controls'
			};
		},
		parent: "#tps-viewer-menu",
		initialize: function() {
			var action,
				aButton;
			this.$el.html('<h3>Camera Controls</h3>');
			this.cameraActions = [];
			// Creates Camera Button instances for each robotic action.
			this.cameraActions['zoomIn'] = new CameraButtonView({'title': 'Zoom In', 'action': 'zoom', 'value': 'in'});
			this.cameraActions['zoomOut'] = new CameraButtonView({'title': 'Zoom Out', 'action': 'zoom', 'value': 'out'});
			this.cameraActions['irisOpen'] = new CameraButtonView({'title': 'Iris Open', 'action': 'iris', 'value': 'open'});
			this.cameraActions['irisClose'] = new CameraButtonView({'title': 'Iris Close', 'action': 'iris', 'value': 'close'});
			this.cameraActions['irisAuto'] = new CameraButtonView({'title': 'Iris Auto', 'action': 'iris', 'value': 'auto'});
			this.cameraActions['panLeft'] = new CameraButtonView({'title': 'Pan Left', 'action': 'pan', 'value': 'left'});
			this.cameraActions['panRight'] = new CameraButtonView({'title': 'Pan Right', 'action': 'pan', 'value': 'right'});
			this.cameraActions['tiltUp'] = new CameraButtonView({'title': 'Tilt Up', 'action': 'tilt', 'value': 'up'});
			this.cameraActions['tiltDown'] = new CameraButtonView({'title': 'Tilt Down', 'action': 'tilt', 'value': 'down'});
			this.cameraActions['screenshot'] = new CameraButtonView({'title': 'Screenshot', 'action': 'screenshot'});
			this.cameraActions['focusNear'] = new CameraButtonView({'title': 'Focus Near', 'action': 'focus', 'value': 'near'});
			this.cameraActions['focusFar'] = new CameraButtonView({'title': 'Focus Far', 'action': 'focus', 'value': 'far'});
			this.cameraActions['focusAuto'] = new CameraButtonView({'title': 'Autofocus', 'action': 'focus', 'value': 'auto'});
			this.cameraActions['refresh'] = new CameraButtonView({'title': 'Refresh','action':'refresh'});
			this.cameraActions['home'] = new CameraButtonView({'title': 'Home', 'action': 'home'});
			for(action in this.cameraActions) {
				// Appends elements to Control View.
				aButton = this.cameraActions[action].$el;
				this.$el.append(aButton);
			}
			$(this.parent).append(this.$el.hide());
			this.cAngle = new AngleControlView();
			this.$el.append("<h4>Camera Angle</h4>");
			this.$el.append(this.cAngle.$el);
		},
		enable: function() {
			this.$el.fadeIn();
		},
		disable: function() {
			this.$el.fadeOut('slow');
		},
		events: {
			'click .camera-action': 'doCameraAction'
		},
		doCameraAction: function(e) {
			var action = e.currentTarget.dataset.action,
				value = e.currentTarget.dataset.value;
			// Tells the Robot to perform camera action.
			app.Model.Robot.robotCommand(action,value);
		}
	});
/**..f) AngleControlView */
	var AngleControlView = Backbone.View.extend({
		tagName: 'canvas',
		className: 'angle-control',
		initialize: function() {
			_.bindAll(this);

			this.el.height = 200;
			this.el.width = 200;

			this.centerX = this.el.width / 2;
			this.centerY = this.el.height / 2;
			this.canvasR = this.centerX - 2;

			this.drawCircle();

			this.$el.on('mouseenter mousemove', this.movePointer);
			this.$el.on('click', this.getValues);
			this.$el.on('mousedown', this.active);
		},
		ctx: function() {
			return this.el.getContext('2d');
		},
		drawCircle: function() {
			this.ctx().beginPath();
			this.ctx().arc(this.centerX, this.centerY, this.canvasR, 0, 2 * Math.PI*2, false);
			this.ctx().fillStyle = "#111";
			this.ctx().fill();
			this.ctx().lineWidth = 5
			this.ctx().strokeStyle = "#eee";
			this.ctx().stroke();
			// Crosshair
			this.ctx().lineWidth = 1;
			this.ctx().moveTo(this.centerX, 0);
			this.ctx().lineTo(this.centerX, this.el.width);

			this.ctx().moveTo(0, this.centerY);
			this.ctx().lineTo(this.el.height, this.centerY);
			this.ctx().stroke();
		},
		drawPointer: function(x, y, color) {
			this.ctx().beginPath();
			this.ctx().arc(x, y, 10, 0, 2 * Math.PI, false);
			this.ctx().fillStyle = color;
			this.ctx().fill();
		},
		removePointer: function() {
			this.ctx().clearRect(0, 0, this.el.width, this.el.height);
		},
		inBoundry: function(x, y) {
			var dist, distX, distY;

			distX = Math.abs(this.centerX - x);
			distY = Math.abs(this.centerY - y);

			dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

			return(dist <= this.canvasR);
		},
		movePointer: function(e, color) {
			var x, y;

			x = e.offsetX;
			y = e.offsetY;

			if(this.inBoundry(x, y)) {
				this.el.style.cursor = 'none';
				this.removePointer();
				this.drawCircle();
				this.drawPointer(x, y, '#09f');
			}
		},
		active: function(e) {
			this.drawPointer(e.offsetX, e.offsetY, 'orange');
		},
		getValues: function(e) {
			var x, y, scale, args;

			x = e.offsetX + ',13';
			y = '13,' + e.offsetY ;

			args = {
				'width': x,
				'height': y,
				'imgWidth': this.el.width,
				'imgHeight': this.el.height
			};

			app.Model.Robot.robotCommand('position', args);
		}
	});
/**..g) SliderView */
	/** $ slider taht controls framerate */
	var SliderView = Backbone.View.extend({
		tagName: 'div',
		className: 'slider',
		initialize: function () {
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
			$('#slider').html(this.$el.hide());
		},
		enable: function() {
			this.$el.show();
		},
		disable: function() {
			this.$el.fadeOut('slow');
		},
		renderSlideValue: function (v) {
			this.$handle.html('');
			// Insert text displaying current slider framerate selection.
			this.$handle.append('Framerate:');
			this.$handle.append(v);
		},
		listen: function () {
			this.on('sliderChanged', this.renderSlideValue);
			app.Model.FrameRate.on('change:value', function () {
				this.$el.slider('value', app.Model.FrameRate.get('value'));
			}, this);
		}
	});
/**..h) PlayButton */
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
			this.$parent.append(this.$el.hide());
			this.$el.click(this.playPause);
		},
		enable: function() {
			this.$el.fadeIn();
		},
		disable: function() {
			this.$el.fadeOut('slow');
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
			if(app.Model.FrameRate.get('value') != '0') {
				this.$el.removeClass('play');
			} else  {
				this.$el.addClass('play');
			}
		}
	});
/**..i) SiteListView */
	// List of each available site -- alternative to map view. */
	var SiteListView = Backbone.View.extend({
		el: '#sites',
		initialize: function() {
			_.bindAll(this);
		},
		render: function() {
			this.$el.html('');
			app.View.Menu.showList();
			// Create menu list for each site and append it to the view.
			app.Model.Sites.forEach(this.addMenu);
			this.$el.show();
		},
		addMenu: function(item) {
			var newMenu = new SiteElement({menu:item});
			this.$el.append(newMenu.$el);
		},
		events: {
			'click li':'openSite'
		},
		openSite: function(e) {
			var siteId = $(e.target).data('siteId');
			app.Router.navigate('sites/' + siteId, {trigger: true});
		}
	});
/**..j) MenuListView */
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
/**..k) MenuElement */			
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
/**..l) SiteElement */
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
/**..m) Menu */
	var Menu = Backbone.View.extend({
		el: '#options-menu',
		events: {
			'click #listMaker':'getList',
			'click #helpMaker':'getHelp'
		},
		getList: function() {
			app.Router.navigate('sites', {trigger: true});
		},
		getHelp: function() {
			app.Router.navigate('help',{trigger: true});
		},
		showList: function() {
			$('#info-view').hide();
			$('#nav').show();
		},
		showHelp: function() {
			$('#nav').hide();
			$('#info-view').show();
		}
	});
/**..n) Full Screen Button */
	var FullScreenButton = Backbone.View.extend({
		tagName: 'button',
		initialize: function() {
			var that = this;
			this.$parent = $('#player-controls');
			this.$el.attr('id','fullScreenButton').addClass('camera-action');
			this.$el.toggle(function() {
					$(this).toggleClass('small');
					that.trigger('fullScreen');
				},
				function() {
					$(this).toggleClass('small');
					that.trigger('fullScreen');
				}
			);
			this.$parent.append(this.$el.hide());
		},
		enable: function() {
			this.$el.fadeIn();
		},
		disable: function() {
			this.$el.fadeOut('slow');
		}
	});
/** 2) Actions  */
	// Ensure template has loaded before trying to attach selectors.
	$(document).ready( function() {
		// Instantiate views on app.View.
		app.View.Stream = new StreamView();
		app.View.Play = new PlayButton();
		app.View.FullScreenButton = new FullScreenButton();
		app.View.FeedImage = new FeedImage();
		app.View.CameraControl = new CameraControlView();
		app.View.Slider = new SliderView();
		app.View.SiteList = new SiteListView();
		app.View.MenuList = new MenuListView();
		app.View.Menu = new Menu();
		app.View.Info = new InfoView();
		app.trigger('viewsRendered');
	});
})(jQuery, Backbone, _);