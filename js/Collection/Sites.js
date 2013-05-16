define([
    'Model/Site'
  , 'app.settings'
  , 'underscore'
  , 'backbone'], 

  function(Site, settings) {
  'use strict';

  var Sites, sites;

  Sites = Backbone.Collection.extend({
    model: Site,
    initialize: function() {
      var that = this,
          inst = [];

      for(var i in settings.locations) {
        inst.push(new Site(settings.locations[i]));
      }
      // Reset sites.
      that.reset(inst);
    }
  });

  var sites = new Sites();

  return sites;
});