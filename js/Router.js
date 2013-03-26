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
      '': 'sitesPage', // Displays nothing -- user must select view -- maybe we should default to one.
      'sites': 'sitesPage',
      'help': 'helpPage', // Displays map for selecting site.
      'sites/:site': 'sitesPage', // Display list of site views.
    },
    helpPage: function() {
      this.trigger('helpRequest');
    },
    sitesPage: function (s) {
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