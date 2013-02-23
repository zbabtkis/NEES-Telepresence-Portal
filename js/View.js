var MapView = Backbone.View.extend({
	el: "#map-view",
	render: function() {
		var that = this;
    	this.$el.gmap3({
    		map: TPSApp.settings.map,
    		marker: {
    			values: function() {
    				var sites = TPSApp.menuListView.menuCollection.where({site_id: 1});
    				console.log(sites);
    				return(sites);
    			},
    			events: {
	    			/*mouseover: function(marker, event, context){
				        var map = jQuery(this).gmap3("get"),
				        	infowindow = jQuery(this).gmap3({get:{name:"infowindow"}});
				        if (infowindow){
				        	infowindow.open(map, marker);
				        	infowindow.setContent(context.get('loc'));
				        } else {
				          	jQuery(this).gmap3({
				          		infowindow:{
				            		anchor:marker, 
				              		options:{content: context.get('loc')}
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
			    		that.trigger('site-opened',context.loc);
			      	}*/
	    		}
    		}
    	});
    	this.$el.show();
    },
});

var FeedView = Backbone.View.extend({
	el: '#nvf-frame',
	render: function() {
		var that = this;
		console.log(TPSApp.View.FeedImage.$el);
		TPSApp.View.FeedImage.$el.load(function() {
			TPSApp.View.Stream.$el.html('');
			//that.stream.$el.prepend(TPSApp.View.CameraControlView.$el);
			TPSApp.View.Stream.$el.append(TPSApp.View.FeedImage.$el);
			//that.stream.$el.append(TPSApp.View.PlayerControlView.$el);
		});
	},
	listen: function() {
		this.listenTo(TPSApp.View.FeedImage, 'newStreamInitialized', this.render);
	}
});

var StreamView = Backbone.View.extend({
	el: '#stream',
});

/** Displays the current feed buffer or image. */
var FeedImage = Backbone.View.extend({
	tagName: 'img',
	class: 'feed-image',
	listen: function() {
		this.listenTo(TPSApp.Model.Feed, 'change:fullRequest', this.change);
	},
	change: function() {
		this.$el.attr('src',TPSApp.Model.Feed.get('fullRequest'));
		this.trigger('newStreamInitialized');
	},
});

/** Input elements allowing user to control the feed */
var CameraControlView = Backbone.View.extend({
	el: '#controls',
	initialize: function() {
		// Handles the communication between the robot and the user.
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
		// Tells the Robot to perform camera action.
		TPSApp.Model.Robot.robotCommand(action,value);
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
	listen: function() {
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
	el: '#sites',
	render: function() {
		this.$el.html('');
		self = this;
		TPSApp.Model.Sites.forEach(function(item) {
			var newMenu = new SiteElement({menu:item});
			self.$el.append(newMenu.$el);
		});
		this.$el.show();
	},
	events: {
		'click li':'openSite'
	},
	openSite: function(e) {
		var siteId = e.currentTarget.dataset.siteId;
		TPSApp.Model.SiteViews.updateViewsList(siteId);
		//this.trigger('siteOpened', loc);
	},
});

var MenuListView = Backbone.View.extend({
	el: '#sub-menu',
	render: function(loc) {
		this.$el.html('');
		var that = this;
		TPSApp.Model.SiteViews.forEach(function(item) {
			newMenu = new MenuElement({menu:item});
			that.$el.append(newMenu.$el);
		});
	},
	events: {
		'click li': 'openFeed',
	},
	openFeed: function(e) {
		var loc  = e.currentTarget.dataset.loc,
			type = e.currentTarget.dataset.type;
		TPSApp.Model.Feed.set({type: type, loc: loc});
	},
	listen: function() {
		this.listenTo(TPSApp.Model.SiteViews, 'reset', this.render);
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
				'data-site-id': this.options.menu.attributes.site_id
			};
		},
		initialize: function() {
			var title = this.options.menu.attributes['loc'];
			this.$el.html(title);
		},
});

var Menu = Backbone.View.extend({
	el: '#options-menu',
	events: {
		'click #listMaker':'addList',
		'click #mapMaker':'renderMap',
	},
	addList: function() {
		TPSApp.navigate('sites', {trigger: true});
	},
	renderMap: function() {
		TPSApp.navigate('map',{trigger: true});
	}
});