var App = Backbone.Router.extend({
		routes: {
			'': 'indexPage',
			'map':'mapPage',
			'sites':'sitesPage',
			'sites/:site':'sitesPage',
			'map/:site':'mapPage',
		},
		navToMap: function() {
			this.navigate('map', {trigger: true});
		},
		navToSites: function() {
			this.navigate('sites',{trigger: true});
		},
		navToSite: function(s) {
			this.navigate('sites/' + s, {trigger: true});
		},
		navToMapSite: function(evt,s) {
			this.navigate('map/' + s, {trigger: true});
		},
		indexPage: function() {
		},
		mapPage: function(s) {
			var that = this;
			if(this.sites) {
				this.sites.$el.hide();
			}
			this.mapView = new MapView();
			this.mapView.render();
			this.mapView.$el.show();
			this.mapView.$el.on('site-opened', that.navToMapSite);
			if(s) {
				this.siteMenu = new MenuListView();
				this.siteMenu.render(s);
				this.listenTo(this.siteMenu, 'feed-requested', that.fetchFeed);
			}
		},
		sitesPage: function(s) {
			if(this.mapView) {
				this.mapView.$el.hide();
			}
			this.sites = new SiteListView();
			this.sites.render();
			this.listenTo(this.sites, 'site-opened', this.navToSite);

			/** Render the new layer of menus */
			if(s) {
				this.siteMenu = new MenuListView();
				this.siteMenu.render(s);
				this.listenTo(this.siteMenu, 'feed-requested', this.fetchFeed);
			}
		},
		fetchFeed: function(v) {
			this.frame = this.frame || new FrameView();
			this.frame.feedModel.set({loc: v.l, type: v.t});
		},
		addListeners: function() {
			this.listenTo(this.optionsMenu, 'list-initialized', this.navToSites);
			this.listenTo(this.optionsMenu, 'map-requested', this.navToMap);
		},
		renderMenu: function(selector) {
			this.optionsMenu = new Menu(selector);
		},
		listen: function() {
			this.addListeners();
		},
});


Drupal.behaviors.nvf2 = {
	attach: function() {
		window.TPSApp = new App();
		window.TPSApp.renderMenu(jQuery('#options-menu'));
		window.TPSApp.listen();
		Backbone.history.start();
		var app = window.TPSApp || {};
	},
};