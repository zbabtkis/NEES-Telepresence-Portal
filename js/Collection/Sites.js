define(['Model/Site'], function(Site) {
  'use strict';

  var Sites, sites;

  Sites = Backbone.Collection.extend({
    model: Site
  });

  return {
    initialize: function() {
      if(!sites) {
        sites = new Sites();
      }
    },
    getSettings: function () {
      if(!sites) {
        this.initialize();
      }

      require(['text!app.settings.js'], function(settings) {
        var inst = [];
        for(var i in settings.locations) {
          inst.push(new Site(settings.locations[i]));
        }
        // Reset sites.
        sites.reset(inst);
      });
    }
  }
});