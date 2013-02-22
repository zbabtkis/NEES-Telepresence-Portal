var MapView = Backbone.View.extend({
	el: "#map-view",
	render: function() {
		var that = this;
    	this.$el.gmap3({
    		map: {
    			options: {
    				center: [37.232253141714885, -119.3115234375],
    				zoom: 5
    			}
    		},
    		marker: {
    			values: [
    				{latLng: [33.0974,-115.531], data: "Garner Valley SFSI Field Site"},
    				{latLng: [33.669,-116.674], data: "Wildlife Liquefaction Array"},
    			],
    			events: {
	    			mouseover: function(marker, event, context){
				        var map = jQuery(this).gmap3("get"),
				        	infowindow = jQuery(this).gmap3({get:{name:"infowindow"}});
				        if (infowindow){
				        	infowindow.open(map, marker);
				        	infowindow.setContent(context.data);
				        } else {
				          	jQuery(this).gmap3({
				          		infowindow:{
				            		anchor:marker, 
				              		options:{content: context.data}
				            	}
				          	});
				        }
			      	},
			      	mouseout: function(){
				    	var infowindow = jQuery(this).gmap3({get:{name:"infowindow"}});
				    	if (infowindow){
				          infowindow.close();
				        }
				    },
			    	click: function(marker, event, context) {
			    		that.trigger('site-opened',context.data);
			      	}
	    		}
    		}
    	});
    	this.$el.show();
    },
});

var FeedView = Backbone.View.extend({
	el: '#nvf-frame',
	initialize: function() {
		// Image wrapper for stream image.
		this.stream = new StreamView();
		// Play/Pause button control menu.
		this.playerControls = new PlayerControlView();
		// Holds connection data for current feed.
		this.feedModel = new FeedModel();
		// User input elements to control feed and camera robotics.
		this.controls = new ControlView();

		this.$el.append(this.stream.$el);
		this.addListeners();
	},
	render: function(type) {
		if(type == 'jpeg') {
			this.__getJpeg();
		} else if (type == 'mjpeg') {
			this.__getMjpeg();
		}
		else {
			this.__getMjpeg();
		}
	},
	__getFeed: function() {
		var that = this;
		// Temporarily stop listening to feedModel to avoid endless loop caused by setting the value of the full feed request.
		this.stopListening(this.feedModel);
		// Selects the stream as either a static jpeg or moving jpeg with a framerate.
		this.feedModel.set('fullRequest', this.feedModel.get('requestAddr') + '/' + this.__type);
		this.listenTo(this.feedModel, 'change', this.render);
		// Creates image element containing new src feed.
		var feedImage = new FeedImage({'src': this.feedModel.get('fullRequest')});
		// Waits until new feed is loaded before removing last feed.
		feedImage.$el.load(function() {
			that.stream.$el.html('');
			that.$el.prepend(that.controls.$el);
			that.stream.$el.append(feedImage.$el);
			that.$el.append(that.playerControls.$el);
		});
	},
	__getJpeg: function() {
		this.__type = 'jpeg';
		this.__getFeed();
	},
	__getMjpeg: function() {
		// If framerate is 0, it should be set to a valid framerate for buffering.
		if (this.controls.frameRateSelector.getFrameRate() == 0) {
			this.controls.frameRateSelector.setFrameRate(5);
			console.log(this.controls.frameRateSelector.getFrameRate());
		}
		var fr = this.controls.frameRateSelector.getFrameRate();
		this.__type = 'mjpeg' + '/' + fr;
		this.__getFeed();
	},
	__pause: function() {
		this.__getJpeg();
	},
	__play: function() {
		this.__getMjpeg();
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
	addListeners: function() {
		// Render immediately when a new feed has been loaded in the model.
		this.listenTo(this.feedModel, 'change', this.render)
		// Updates the url handler on the robot controller.
		this.feedModel.on('change', this.controls.controller.updateRobotHandler, this.controls.controller);
		// Routes a rerendering as either a still or moving image when the user changes the framerate.
		this.listenTo(this.controls.frameRateSelector.frameRate, 'change', this.updateFramerate);
		// Play Pause listeners.
		this.listenTo(this.playerControls.play, 'playerPaused', this.__pause);
		this.listenTo(this.playerControls.play, 'playerPlayed', this.__play);
	},
});

var StreamView = Backbone.View.extend({
	tagName: 'div',
	attributes: function() {
		return {
			'id': 'stream',
		};
	},
});
/** Displays the current feed buffer or image. */
var FeedImage = Backbone.View.extend({
	tagName: 'img',
	class: 'feed-image',
	initialize: function() {
		var that = this;
		this.$el.attr('src',that.options.src);
	}
});

/** Input elements allowing user to control the feed */
var ControlView = Backbone.View.extend({
	tagName: 'div',
	attributes: function() {
		return {
			'id': 'controls',
		};
	},
	initialize: function() {
		// Handles the communication between the robot and the user.
		this.controller = new ControllerModel();
		this.frameRateSelector = new SliderView();
		this.frameRateSelector.$el.addClass('framerate');
		// Adds slider to controller view.
		this.$el.append(this.frameRateSelector.$el);
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
		for(action in this.cameraActions) {
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
		// Tells the controller to perform robotic action.
		this.controller.robotCommand(action,value);
	}
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

/** jQuery slider taht controls framerate */
var SliderView = Backbone.View.extend({
	tagName: 'div',
	className: 'slider',
	initialize: function() {
		var that = this;
		this.frameRate = new FrameRateModel();
		var that = this;
		this.$el.slider({
			max: that.frameRate.get('max'),
			value: that.frameRate.get('value'),
			change: function(ob, fr) {
				that.setFrameRate(fr);
				console.log('fr changed from slider');
			},
			slide: function(ob, fr) {
				that.trigger('framerate-sliding', fr.value);
			}
		});
		// jQuery slider handle selector to append framerate value to.
		this.$handle = this.$el.find('.ui-slider-handle');
		this.framerateLabel = new FrameRateLabel();
		this.framerateValue = new FrameRateValue({value: this.frameRate.get('value')});
		// Insert text displaying current slider framerate selection.
		this.$handle.append(this.framerateLabel.$el);
		this.$handle.append(this.framerateValue.$el);
		this.addListeners();
	},
	setFrameRate: function(fr) {
		//deal with inputs from both the slider and the play pause button
		if(typeof fr == 'number') {
			this.frameRate.set('value', fr);
		} else if(fr) {
			this.frameRate.set('value', fr.value);
		}
	},
	getFrameRate: function() {
		return this.frameRate.get('value');
	},
	renderSlideValue: function(v) {
		// Inserts the new framerate below the slider bar.
		this.framerateValue.$el.html(v);
	},
	addListeners: function() {
		this.on('framerate-sliding', this.renderSlideValue);
	}
});

/** Label displaying "Framerate" */
var FrameRateLabel = Backbone.View.extend({
	tagName: 'label',
	className: 'framerate',
	initialize: function() {
		this.$el.html('Framerate');
	},
});

// Displays current framerate value based on status of the framerate slider */
var FrameRateValue = Backbone.View.extend({
	tagName: 'span',
	className: 'handle-value',
	initialize: function() {
		this.$el.html(this.options.value);
	}
});

/** Allows user to play and pause feed -- might take this out to avoid conflicts with slider/user confusion */
var PlayerControlView = Backbone.View.extend({
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
		initialize: function() {
			this.$el = jQuery('#sites');
			this.$el.html('');
		},
		render: function() {
			this.menus = new SiteCollection();
			self = this;
			this.menus.forEach(function(item) {
				newMenu = new SiteElement({menu:item});
				self.$el.append(newMenu.$el);
			});
			this.$el.show();
		},
		events: {
			'click li':'openSite'
		},
		openSite: function(e) {
			var loc = e.currentTarget.dataset.loc;
			this.trigger('site-opened', loc);
		}
});

var MenuListView = Backbone.View.extend({
		initialize: function() {
			this.$el = jQuery('#sub-menu');
			this.$el.html('');
		},
		render: function(loc) {
			this.menus = new MenuCollection();
			self = this;
			this.menus.forEach(function(item) {
				if(item.attributes.loc == loc) {
					newMenu = new MenuElement({menu:item});
					self.$el.append(newMenu.$el);
				}
			});
			this.$el.show();
		},
		events: {
			'click li': 'openFeed',
		},
		openFeed: function(e) {
			var loc  = e.currentTarget.dataset.loc,
				type = e.currentTarget.dataset.type;
			this.trigger('feed-requested', {t: type, l: loc});
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

var SiteElement = Backbone.View.extend({
		tagName: 'li',
		className: 'site-link',
		attributes: function(){
			return {
				'data-loc': this.options.menu.attributes.loc
			};
		},
		initialize: function() {
			var self = this;
			var title = this.options.menu.attributes['loc'];
			this.$el.html(title);
		},
});

var Menu = Backbone.View.extend({
	initialize: function(selector) {
		this.$el = selector;
	},
	events: {
		'click #listMaker':'addList',
		'click #mapMaker':'renderMap',
	},
	addList: function() {
		this.trigger('list-initialized');
	},
	renderMap: function() {
		this.trigger('map-requested');
	}
});