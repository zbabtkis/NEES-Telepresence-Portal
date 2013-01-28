var MainView = Backbone.View.extend({
	initialize: function() {
		this.nav = new MenuListView();
		this.sites = new SiteMenu();
		this.controls = new ControlView();
		this.render();
		
	},
	events: {
		'click #mapMaker':'renderMapView',
		'click #listMaker':'renderSites',
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
	renderSiteView: function(loc) {
		this.nav.render(loc);
		nav = jQuery('#nav');
		nav.html(this.nav.$el);
		nav.tabs();
	},
	renderSites: function() {
		TPSApp.navigate('locations/', {trigger: true});
	}
});

var SiteMenu = Backbone.View.extend({
	initialize: function() {
		this.el = jQuery('#sites');
		this.sites = new SiteCollection();
		this.children = new SiteElementCollection();
	},
	render: function() {
		self = this;
		this.sites.forEach(function(item) {
			self.children.add(new SiteElement({menu:item}));
		});
		this.children.forEach(function(li) {
			jQuery(self.el).append(li.attributes.$el);
		});
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

var MenuListView = Backbone.View.extend({
		initialize: function() {
			this.menus = new MenuCollection();
			this.children = new MenuElementCollection();
			this.render();
		},
		tagName: 'ul',
		render: function(loc) {
			self = this;
			menus = this.menus;
			menus.forEach(function(item) {
				if(item.attributes.loc == loc) {
					self.children.add(new MenuElement({menu:item}));
				}
			});
			this.children.forEach(function(li) {
				self.$el.append(li.attributes.$el);
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
		events: {
			'click': 'navigate'
		},
		initialize: function() {
			var self = this;
			var title = this.options.menu.attributes['title'];
			this.$el.html(title);
		},
		navigate: function(menu) {
			console.log('navigating...');
			var type = this.options.menu.attributes['type'];
			var loc = this.options.menu.attributes['loc'];
			var uri = 'feed/' + loc + '/' + type;
			TPSApp.navigate(uri, {trigger: true});
		}
});

var SiteElement = Backbone.View.extend({
		tagName: 'li',
		className: 'site-link',
		attributes: function(){
			return {
				'data-site-id': this.options.menu.attributes['site_id']
			};
		},
		events: {
			'click': 'navigate'
		},
		initialize: function() {
			var self = this;
			var title = this.options.menu.attributes['loc'];
			this.$el.html(title);
		},
		navigate: function(menu) {
			var loc = this.options.menu.attributes['loc'];
			TPSApp.navigate('locations/' + loc, {trigger: true});
		}
});
