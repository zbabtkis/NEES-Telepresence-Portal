var MainView = Backbone.View.extend({
	initialize: function() {
		this.nav = new MenuListView();
		this.controls = new ControlView();
		this.render();
		
	},
	events: {
		'click #mapMaker':'renderMapView'
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
		jQuery('#vnf-video-wrapper').append('<img src="' + this._requestAddr + '">');
	},
	render: function() {
	    this.$el = jQuery("#TPS-Viewer");
	    this.$el.nav = jQuery('#nav');
	    this.$el.nav.html(this.nav.$el);
	    this.$el.nav.tabs();
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
		render: function() {
			self = this;
			menus = this.menus;
			menus.forEach(function(item) {
				self.children.add(new MenuElement({menu:item}));
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
