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
		this.controls = new ControlView();
		this.$el.append(this.stream.$el);
		this.feedModel = new FeedModel();
		this.listenTo(this.feedModel, 'change', this.render)
		this.listenTo(this.controls.frameRateSelector.frameRate, 'change', this.updateFramerate);
	},
	render: function(type, fr) {
		this.frameRate = fr || 5;
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
		var fullRequest = this.feedModel.requestAddr + '/' + this._type;
		var feedImage = new FeedImage({'src': fullRequest});
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
		this._type = 'mjpeg' + '/' + this.frameRate;
		this.__getFeed();
	},
	__pause: function() {
		this.__getJpeg();
	},
	__play: function() {
		this.__getMjpeg();
	},
	updateFramerate: function(f){
		console.log('upadating frameRate...');
		this.render('mjpeg', f.get('value'));
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
		this.frameRateSelector = new SliderView();
		this.frameRateSelector.$el.addClass('framerate');
		this.$el.append(this.frameRateSelector.$el);
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
		this.frameRate.set('value', fr.value);
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
		this.$el.html('||');
	},
	playPause: function() {
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