var app = window.app || (window.app = {});

(function (Backbone) {

  'use strict';

  var Router = Backbone.Router.extend({
    routes: {
      '': 'indexPage',
      'map': 'mapPage',
      'sites': 'sitesPage',
      'sites/:site': 'sitesPage',
      'map/:site': 'mapPage',
    },
    navToSite: function (s) {
      this.navigate('sites/' + s, {trigger: true});
    },
    navToMapSite: function (evt, v) {
      this.navigate('map/' + evt, {trigger: true});
    },
    indexPage: function () {
    },
    mapPage: function (s) {
      var that = this;
      if (app.View.SiteList) {
        app.View.SiteList.$el.hide();
      }
      app.View.Map.render();
      app.View.Map.$el.show();
      this.listenTo(app.View.Map, 'site-opened', that.navToMapSite);
      if (s) {
        app.View.MenuList.render(s);
        this.listenTo(app.View.MenuList, 'feed-requested', that.fetchFeed);
      }
    },
    sitesPage: function (s) {
      if (app.View.Map) {
        app.View.Map.$el.hide();
      }
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