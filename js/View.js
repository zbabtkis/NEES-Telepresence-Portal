var MapView = Backbone.View.extend({
	el: "#map-view",
	render: function() {
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
			    		this.trigger('site-opened',context.data);
			      	}
	    		}
    		}
    	});
    	this.$el.show();
    },
});

var FrameView = Backbone.View.extend({
	el: '#nvf-frame',
	initialize: function() {
		this.stream = new StreamView();
		this.playerControls = new PlayerControlView();
		this.feedModel = new FeedModel();
		this.controls = new ControlView();
		this.$el.append(this.stream.$el);
		this.listenTo(this.feedModel, 'feedUpdated', this.render)
		this.listenTo(this.controls.frameRateSelector.frameRate, 'change', this.updateFramerate);
	},
	render: function(type) {
		console.log('rendering feed...');
		if(type == 'jpeg') {
			this.__getJpeg();
		} else if (type == 'mjpeg') {
			this.__getMjpeg();
		}
		else {
			this.__getJpeg();
		}
	},
	__getFeed: function() {
		var that = this;
		this.stopListening(this.feedModel);
		this.feedModel.set('fullRequest', this.feedModel.requestAddr + '/' + this._type);
		this.listenTo(this.feedModel, 'change', this.render);
		var feedImage = new FeedImage({'src': this.feedModel.get('fullRequest')});
		feedImage.$el.load(function() {
			that.stream.$el.html('');
			that.$el.prepend(that.controls.$el);
			that.stream.$el.append(feedImage.$el);
			that.$el.append(that.playerControls.$el);
		});
		this.listenTo(this.playerControls.play, 'playerPaused', this.__pause);
		this.listenTo(this.playerControls.play, 'playerPlayed', this.__play);
	},
	__getJpeg: function() {
		this._type = 'jpeg';
		this.__getFeed();
	},
	__getMjpeg: function() {
		var fr = this.controls.frameRateSelector.getFrameRate();
		this._type = 'mjpeg' + '/' + fr;
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
		if(v > 1) {
			this.render('mjpeg');
		} else {
			this.render('jpeg');
		}
	}
});

var StreamView = Backbone.View.extend({
	tagName: 'div',
	attributes: function() {
		return {
			'id': 'stream',
		};
	},
});

var FeedImage = Backbone.View.extend({
	tagName: 'img',
	class: 'feed-image',
	initialize: function() {
		that = this;
		this.$el.attr('src',that.options.src);
	}
});

var ControlView = Backbone.View.extend({
	tagName: 'div',
	attributes: function() {
		return {
			'id': 'controls',
		};
	},
	initialize: function() {
		this.controller = new ControllerModel();
		this.frameRateSelector = new SliderView();
		this.frameRateSelector.$el.addClass('framerate');
		this.$el.append(this.frameRateSelector.$el);
		this.addCameraButtons();
	},
	addCameraButtons: function() {
		this.cameraActions = [];
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
		this.controller[action](value);
	}
});

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

var SliderView = Backbone.View.extend({
	tagName: 'div',
	className: 'slider',
	initialize: function() {
		this.frameRate = new FrameRateModel();
		var that = this;
		this.$el.slider({
			max: 10,
			value: 5,
			change: function(ob, fr) {
				that.setFrameRate(fr);
				console.log('fr changed from slider');
			},
			slide: function(ob, fr) {
				that.trigger('framerate-sliding', fr.value);
			}
		});
		this.$handle = this.$el.find('.ui-slider-handle');
		this.framerateLabel = new FrameRateLabel();
		this.framerateValue = new FrameRateValue();
		this.$handle.append(this.framerateLabel.$el);
		this.$handle.append(this.framerateValue.$el);
		this.setListeners();
	},
	setFrameRate: function(fr) {
		//deal with inputs from both the slider and the play pause button
		console.log(fr);
		if(fr) {
			this.frameRate.set('value', fr.value);
		}
	},
	getFrameRate: function() {
		return this.frameRate.get('value');
	},
	renderSlideValue: function(v) {
		this.framerateValue.$el.html(v);
	},
	setListeners: function() {
		this.on('framerate-sliding', this.renderSlideValue);
	}
});

var FrameRateLabel = Backbone.View.extend({
	tagName: 'label',
	className: 'framerate',
	initialize: function() {
		this.$el.html('Framerate');
	},
});

var FrameRateValue = Backbone.View.extend({
	tagName: 'span',
	className: 'handle-value',
	initialize: function() {
		this.$el.html('Still');
	}
});

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
	}
});

var PlayButton = Backbone.View.extend({
	tagName: 'button',
	className: 'play-pause',
	attributes: function() {
		return {
			'data-control-option': 'play',
		};
	},
	initialize: function() {
		this.$el.html('>');
	},
	playPause: function() {
		this.state = this.state || 'pause';
		if(this.state === 'play') {
			this.$el.html('>');
			this.state = 'pause';
			this.trigger('playerPaused');
		} else  {
			this.$el.html('||');
			this.state = 'play';
			this.trigger('playerPlayed');
		}
	}
});

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
			var loc = e.currentTarget.dataset.loc,
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
			//console.log('created new site menu element');
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