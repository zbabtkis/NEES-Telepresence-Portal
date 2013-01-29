var MainView = Backbone.View.extend({
	initialize: function() {
		this.nav = new MenuListView();
		this.sites = new SiteListView();
		this.controls = new ControlView();
		this.render();
		
	},
	events: {
		'click .feed-link':'renderFeed',
		'click #mapMaker':'renderMapView',
		'click #listMaker':'navToSites',
		'click .site-link':'navToViews'
	},
	renderFeed: function(el) {
		var type = el.currentTarget.dataset.type;
		var loc = el.currentTarget.dataset.loc;
		var uri = 'locations/' + loc + '/' + type;
		TPSApp.navigate(uri, {trigger: true});
	},
	renderMapView: function() {
        var mapOptions = {
          center: new google.maps.LatLng(33.662068,-116.685104),
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById('vnf-video-wrapper'), mapOptions);
        var marker = new google.maps.Marker({
		    position: new google.maps.LatLng(33.662068,-116.685104),
		    map: map,
		    title:"Hello World!"
		});
		google.maps.event.addListener(marker, 'click', function() {
	        var gm_id = marker.__gm_id;
	        
	    });
	},
	setControls: function() {
		var el = '<applet code="com.charliemouse.cambozola.Viewer" archive="cambozola.jar" width="352" height="400"><param name="url" value="' + this._requestAddr + '"></applet>';
		jQuery('#vnf-video-wrapper').append(el);
	},
	render: function() {
	    this.$el = jQuery("#TPS-Viewer");
	},
	renderViews: function(loc) {
		nav = jQuery('#nav');
		if(loc) {
			this.nav.render(loc);
		}
		//console.log('listing location views...');
		nav.html(this.nav.$el);
	},
	navToSites: function() {
		TPSApp.navigate('locations/', {trigger: true});
	},
	navToViews: function(el) {
		var loc = el.currentTarget.dataset.loc;
		TPSApp.navigate('locations/' + loc, {trigger: true});
	}
});

var FrameView = Backbone.View.extend({
	initialize: function() {
		this.$el = jQuery("nvf-frame");
		this.feedModel = new FeedModel({loc: this.options.loc, size: this.options.type});
		this.listenTo(TPSApp.TPSView.controls,'framerateChanged', this.updateFramerate);
	},
	render: function(type, fr) {
		if(type == 'jpeg') {
			this.getJpeg();
		} else if (type == 'mjpeg') {
			this.getMjpeg(fr);
		}
		else {
			this.getJpeg();
		}
	},
	_getFeed: function() {
		var fullRequest = this.feedModel.requestAddr + '/' + this._type;
		jQuery('#vnf-video-wrapper').html('<img src="' + fullRequest + '">');
	},
	getJpeg: function() {
		this._type = 'jpeg';
		this._getFeed();
	},
	getMjpeg: function(frameRate) {
		this._type = 'mjpeg' + '/' + frameRate;
		this._getFeed();
	},
	updateFramerate: function(framerate){
		this.render('mjpeg',framerate);
		console.log('upadating frameRate...');
	}
});

var ControlView = Backbone.View.extend({
	initialize: function() {
		self = this;
		jQuery('.slider').slider({
			max: 10,
			value: 5,
			change: function(ob, fr) {
				self.trigger('framerateChanged', fr.value);
			}
		});
	},
});

var SiteListView = Backbone.View.extend({
	initialize: function() {
		this.el = jQuery('#sites');
	},
	render: function() {
		this.sites = new SiteCollection();
		//console.log('created new site collection');
		this.children = new SiteElementCollection();
		//console.log('created new collection of site list elements');
		self = this;
		this.$el.html('');
		//console.log('set value of' + this.$el + ' to ""');
		this.sites.forEach(function(item) {
			//console.log('added new site to site collection');
			self.children.add(new SiteElement({menu:item}));
		});
		this.children.forEach(function(li) {
			//console.log('added new site to list');
			jQuery(self.el).append(li.attributes.$el);
		});
	}
});

var MenuListView = Backbone.View.extend({
		initialize: function() {
		},
		tagName: 'ul',
		render: function(loc) {
			this.menus = new MenuCollection();
			//console.log('created new menu collection');
			this.children = new MenuElementCollection();
			//console.log('created collection for menu elements')
			self = this;
			this.menus.forEach(function(item) {
				if(item.attributes.loc == loc) {
						self.children.add(new MenuElement({menu:item}));
						//console.log('added new child menu element to menu collection ');
				}
			});
			this.$el.html('');
			//console.log('set value of menu' + this.$el + ' to ""');
			this.children.forEach(function(li) {
				self.$el.append(li.attributes.$el);
				//console.log('added child element markup to list children');
			});
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
			//console.log('new menu element created');
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
