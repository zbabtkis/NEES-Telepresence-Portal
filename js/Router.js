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
      'sites/:site/:view': 'feedPage'
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
        //If pushState, change %20 to space
        s = unescape(s);
        app.Model.SiteViews.updateViewsList(s);
      }
    },
    feedPage: function(loc, view) {
      this.sitesPage(loc);
      app.Model.Feed.set({loc: loc, type: view});
    }
  });
  app.Router = new Router();
}(Backbone));