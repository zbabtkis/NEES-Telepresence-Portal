/**
 --------------------------------------------------------------------
      Nees Telepresence -- Backbone.js Application  
 --------------------------------------------------------------------
 ********************************************************************
 --------------------------------------------------------------------
                Contents          
 --------------------------------------------------------------------
  2. Actions
   a. add Backbone.Events mixin to app
   b. viewsRender listener
	 - add app Router
	 - Router.listen 
	 - start Backbone history
 1. App
   a. Router
   b. Settings
    - map (google maps rendering data)
    - locations (nees site location data)
    - views (nees site specific view data)
 ********************************************************************/

var app = window.app || (window.app = {});

(function($) {

	"use strict";

	// Mixin Backbone.Events so 'viewsRendered' can be triggered on app.
	_.extend(app,Backbone.Events);

	// Views must be rendered on document ready before Router
	// can trigger additional rendering.
	app.on('viewsRendered', function() {
		app.Router = new Router();
		app.Router.listen();
		// Wait to listen for routes until router has been instantiated
		Backbone.history.start();
	});

	var Router = Backbone.Router.extend({
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
			console.log('hello');
		},
		mapPage: function(s) {
			var that = this;
			if(app.View.SiteList) {
				app.View.SiteList.$el.hide();
			}
			app.View.Map.render();
			app.View.Map.$el.show();
			this.listenTo(app.View.Map,'site-opened', that.navToMapSite);
			if(s) {
				app.View.MenuList.render(s);
				this.listenTo(app.View.MenuList, 'feed-requested', that.fetchFeed);
			}
		},
		sitesPage: function(s) {
			if(app.View.Map) {
				app.View.Map.$el.hide();
			}
			console.log('sites');
			app.Model.Sites.getSettings();
			app.View.SiteList.render();
			this.listenTo(app.View.SiteList, 'siteOpened', this.navToSite);
			// Render the second menu layer (site views) under the site list
			if(s) {
				app.View.MenuList.render(s);
				// Listen for user view selection
				this.listenTo(app.View.MenuList, 'feed-requested', this.setFeed);
			}
		},
		setFeed: function(v) {
			app.Model.FeedModel.set({loc: v.l, type: v.t});
		},
		listen: function() {
			for(var i in app.Model) {
				if(typeof app.Model[i].addLocationsFromSettings === 'function') {
					app.Model[i].addLocationsFromSettings();
				}
				if(typeof app.Model[i].listen === 'function') {
					app.Model[i].listen();
				}
			}
			for(var i in app.View) {
				if(typeof app.View[i].listen === 'function') {
					app.View[i].listen();
				}
			}
			return('listening');
		}
	});

	// Holds site information to render in map and list views.
	app.Settings = {
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

})(jQuery);