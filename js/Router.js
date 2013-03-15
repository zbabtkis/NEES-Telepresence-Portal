/**
 --------------------------------------------------------------------
      Nees Telepresence -- App Router
 --------------------------------------------------------------------
 ********************************************************************
 --------------------------------------------------------------------
                Contents          
 --------------------------------------------------------------------
 1. Implement Router
 2. Instantiate Router
 --------------------------------------------------------------------
                Uses          
 --------------------------------------------------------------------
 1. Backbone
 ********************************************************************/

var app = window.app || (window.app = {});

(function (Backbone) {

  'use strict';

  var Router = Backbone.Router.extend({
    routes: {
      '': 'indexPage', // Displays nothing -- user must select view -- maybe we should default to one.
      'map': 'mapPage', // Displays map for selecting site.
      'sites': 'sitesPage', // Display list of sites.
      'sites/:site': 'sitesPage', // Display list of site views.
      'map/:site': 'mapPage' // Display list of site views with map of sites above.
    },
    indexPage: function () {
    },
    mapPage: function (s) {
      var that = this;
      // Hide the list view if map view is selected.
      if (app.View.SiteList) {
        app.View.SiteList.$el.hide();
      }
      // Load sites from app Settings.
      app.Model.Sites.getSettings();
      app.View.Map.render();
      app.View.Map.$el.show();
      // Resize hack to make sure gmaps loads completely.
      google.maps.event.trigger(app.View.Map.map, "resize");
      // If site is selected, show its views.
      if (s) {
        app.Model.SiteViews.updateViewsList(s);
        // Listen for site view clicks.
        this.listenTo(app.View.MenuList, 'feed-requested', function () {
          app.Model.FeedModel.set({loc: v.l, type: v.t});
        });
      }
    },
    sitesPage: function (s) {
      // Hide map if showing.
      if (app.View.Map) {
        app.View.Map.$el.hide();
      }
      // Load Sites from app settings.
      app.Model.Sites.getSettings();
      app.View.SiteList.render();
      // Render the second menu layer (site views) under the site list
      if (s) {
        app.Model.SiteViews.updateViewsList(s);
        // Listen for user view selection
        this.listenTo(app.View.MenuList, 'feed-requested', function () {
          app.Model.FeedModel.set({loc: v.l, type: v.t});
        });
      }
    }
  });
  app.Router = new Router();
}(Backbone));