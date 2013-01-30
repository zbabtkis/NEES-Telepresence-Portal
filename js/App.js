var App = Backbone.Router.extend({
		initialize: function() {
		},
		routes: {
			'': 'indexPage',
			'map':'mapPage',
			'sites':'sitesPage',
			'sites/:site':'sitesPage',
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
		indexPage: function() {
		},
		mapPage: function() {
			if(this.sites) {
				this.sites.$el.hide();
			}
			this.mapView = new MapView();
			this.mapView.render();
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
			this.frame = new FrameView({loc: v.l, type: v.t});
			this.frame.controls = new ControlView();
			this.frame.render();
			this.frame.listenTo(this.frame.controls.frameRateSelector, 'framerate-changed', this.frame.updateFramerate);
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
	},
};