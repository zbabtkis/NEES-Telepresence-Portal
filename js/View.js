var MapView = Backbone.View.extend({
	initialize: function() {
		this.$el = jQuery("#map-view");
	},
	render: function() {
    	this.$el.width("600px").height("350px").gmap3();
    	this.$el.show();
    },
});

var FrameView = Backbone.View.extend({
	initialize: function() {
		this.$el = jQuery("#nvf-frame");
		this.feedModel = new FeedModel({loc: this.options.loc, size: this.options.type});
		//this.listenTo(TPSApp.TPSView.controls,'framerateChanged', this.updateFramerate);
	},
	render: function(type, fr) {
		if(type == 'jpeg') {
			this.__getJpeg();
		} else if (type == 'mjpeg') {
			this.__getMjpeg(fr);
		}
		else {
			this.__getJpeg();
		}
	},
	__getFeed: function() {
		var fullRequest = this.feedModel.requestAddr + '/' + this._type;
		var el = '<img src="' + fullRequest + '" />';
		this.$el.html(el);
		console.log(fullRequest);
	},
	__getJpeg: function() {
		this._type = 'jpeg';
		this.__getFeed();
	},
	__getMjpeg: function(frameRate) {
		this._type = 'mjpeg' + '/' + frameRate;
		this.__getFeed();
	},
	updateFramerate: function(f){
		this.render('mjpeg',f);
		console.log('upadating frameRate...');
	}
});

var ControlView = Backbone.View.extend({
	initialize: function() {
		this.$el = jQuery('#controls');
		this.$el.html('');
		this.frameRateSelector = new SliderView();
		this.frameRateSelector.$el.addClass('framerate');
		this.$el.append('<label>Framerate: </label>', this.frameRateSelector.$el);
		this.listenTo(this.frameRateSelector, 'framerate-sliding', this.renderSlideValue);
		this.handleBar = jQuery('.ui-slider-handle');
		this.handleBar.after("<span class='handle-value'></span>");
		this.handleBar.valuespan = jQuery(".handle-value");
	},
	renderSlideValue: function(v) {
		this.handleBar.valuespan.html(v);
	}
});

var SliderView = Backbone.View.extend({
	tagName: 'div',
	className: 'slider',
	initialize: function() {
		self = this;
		this.$el.slider({
			max: 10,
			value: 5,
			change: function(ob, fr) {
				self.trigger('framerate-changed', fr.value);
			},
			slide: function(ob, fr) {
				self.trigger('framerate-sliding', fr.value);
			}
		});
	},
})

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