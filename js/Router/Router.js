define(['underscore','backbone'], function () {

  'use strict';

  var _ = require('underscore'),
      router;

  var Router = Backbone.Router.extend({
    routes: {
      '': 'sitesPage', // Displays nothing -- user must select view -- maybe we should default to one.
      'sites': 'sitesPage',
      'help': 'helpPage', // Displays map for selecting site.
      'sites/:site': 'sitesPage', // Display list of site views.
      'sites/:site/:view': 'feedPage'
    },
    helpPage: function() {
      require(['View/Info'], function(Help) {
        Help.render();
      });
    },
    sitesPage: function (s) {
      // Load Sites from app settings.
      require(['Collection/Sites', 'View/Sites'], function(collection, view) {
        collection.getSettings();
        view.render();
      });
      // Render the second menu layer (site views) under the site list
      if (s) {
        require(['Model/Cameras'], function(cameras) {
          // If pushState, change %20 to space.
          s = unescape(s);
          cameras.updateViewsList(s);
        });
      }
    },
    feedPage: function(loc, view) {
      this.sitesPage(loc);
      require(['Model/Feed'], function(feed) {
        feed.set({loc:loc, type: view});
      });
    }
  });

  router = new Router();

  return {
    navigate: router.navigate
  };

});
