var TPSApp = TPSApp || (window.TPSApp = {});
var View = function() {
	this.Menu           = new Menu();
	this.Map            = new MapView();
	this.SiteList       = new SiteListView();
	this.MenuList       = new MenuListView();
	this.FeedImage      = new FeedImage();
	this.Feed           = new FeedView();
	this.CameraControl  = new CameraControlView();
	this.PlayerControl  = new PlayerControlView();
	this.Stream         = new StreamView();
};

var Model = function() {
	// App Models
	this.FrameRateModel = new FrameRateModel();
	this.Feed           = new FeedModel();
	this.Robot          = new Robot();
	// App Collections 
	this.SiteViews      = new SiteViewCollection();
	this.Sites          = new SiteCollection();
	
};

var Settings = {
	map: {
		options: {
			center: [37.232253141714885, -119.3115234375],
			zoom: 5,
		}
	},
	locations: [
		{
			loc:"Garner Valley SFSI Field Site",
			site_id: 1, 
			latLng: [33.0974,-115.531]
		},
		{
			loc:"Wildlife Liquefaction Array",
			site_id: 2,
			latLng: [33.669,-116.674]
		}
	],
	views: [
		{
			loc:"Garner Valley SFSI Field Site",
			type:"Full-Size",
			title:"Full-Size",
			site_id: 1, 
		},
		{
			loc:"Garner Valley SFSI Field Site",
			type:"Inside",
			title:"Inside", 
			site_id: 1,
		},
		{
			loc:"Wildlife Liquefaction Array",
			type:"Full-Size",
			title:"Full-Size", 
			site_id: 2
		},
		{
			loc:"Wildlife Liquefaction Array",
			type:"Internal - when personnel onsite",
			title:"Internal - when personnel onsite", 
			site_id: 2
		}
	]
};

App = Backbone.Router.extend({
	routes: {
		'': 'indexPage',
		'map':'mapPage',
		'sites':'sitesPage',
		'sites/:site':'sitesPage',
		'map/:site':'mapPage',
	},
	navToSite: function(s) {
		this.navigate('sites/' + s, {trigger: true});
	},
	navToMapSite: function(evt, v) {
		this.navigate('map/' + evt, {trigger: true});
	},
	indexPage: function() {
	},
	mapPage: function(s) {
		var that = this;
		if(TPSApp.View.SiteList) {
			TPSApp.View.SiteList.$el.hide();
		}
		TPSApp.View.Map.render();
		TPSApp.View.Map.$el.show();
		this.listenTo(this.map,'site-opened', that.navToMapSite);
		if(s) {
			TPSApp.View.MenuList.render(s);
			this.listenTo(TPSApp.View.MenuList, 'feed-requested', that.fetchFeed);
		}
	},
	sitesPage: function(s) {
		if(TPSApp.View.Map) {
			TPSApp.View.Map.$el.hide();
		}
		TPSApp.View.SiteList.render();
		this.listenTo(TPSApp.View.SiteList, 'siteOpened', this.navToSite);
		// Render the second menu layer (site views) under the site list
		if(s) {
			TPSApp.View.MenuList.render(s);
			// Listen for user view selection
			this.listenTo(TPSApp.View.MenuList, 'feed-requested', this.setFeed);
		}
	},
	setFeed: function(v) {
		this.Model.FeedModel.set({loc: v.l, type: v.t});
	},
	initialize: function() {
		this.Settings      = Settings;
		this.Model         = new Model();
		this.View          = new View();
	},
	listen: function() {
		for(i in this.Model) {
			if(typeof this.Model[i].addLocationsFromSettings === 'function') {
				this.Model[i].addLocationsFromSettings();
			}
			if(typeof this.Model[i].listen === 'function') {
				this.Model[i].listen();
			}
		}
		for(i in this.View) {
			if(typeof this.View[i].listen === 'function') {
				this.View[i].listen();
			}
		}
		return('listening');
	}
});

Drupal.behaviors.nvf2 = {
	attach: function() {
		TPSApp             = new App();
		TPSApp.listen();
		Backbone.history.start();
		var app = window.TPSApp || {};
	},
};