define([
    'View/Info'
  , 'View/Sites'
  , 'View/CameraList'
  , 'View/Stream'
  , 'View/CameraControls'
  , 'underscore'
  , 'backbone'], 

  function () {

  'use strict';

  var router;

  var Router = Backbone.Router.extend({
    routes: {
      '': 'sitesList',
      'sites': 'sitesList',
      'help': 'helpPage',
      'sites/:site': 'camerasList',
      'sites/:site/:cam': 'feedView'
    },
    helpPage: function() {
      var Info = require('View/Info');

      Info.render();
    },
    sitesList: function() { 
      var Sites = require('View/Sites');

      Sites.render();
    },
    camerasList: function(site) {
      var Cameras = require('View/CameraList');

      this.sitesList();
      Cameras.update(site);
    },
    feedView: function(site, cam) {
      var Stream   = require('View/Stream');

      this.camerasList(site);
      Stream.load(cam);
    }
  });

  return {
    initialize: function() {
       router = new Router();

       this.navigate = router.navigate
    }
  };

});
