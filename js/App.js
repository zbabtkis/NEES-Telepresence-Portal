/**
 --------------------------------------------------------------------
      Nees Telepresence -- Backbone.js Application  
 --------------------------------------------------------------------
 ********************************************************************
 --------------------------------------------------------------------
                Contents          
 --------------------------------------------------------------------
 1. App
   a. add Backbone.Events mixin to app
   b. viewsRender listener
     - add app Router
     - Router.listen 
     - start Backbone history
   c. implementapp.init();
 ********************************************************************/
 
var app = window.app || (window.app = {});

(function (Backbone, _) {

  'use strict';

  _.extend(app, Backbone.Events);

  // Views must be rendered on document ready before Router
  // can trigger additional rendering.
  app.on('viewsRendered', function () {
    app.init();
    // Wait to listen for routes until router has been instantiated
    Backbone.history.start();
  });

  app.init = function () {
    for (var mKey in app.Model) {
      if(typeof app.Model[mKey].addLocationsFromSettings === 'function') {
        app.Model[mKey].addLocationsFromSettings();
      }
      if(typeof app.Model[mKey].listen === 'function') {
        app.Model[mKey].listen();
      }
    }
    for (var vKey in app.View) {
      if(typeof app.View[vKey].listen === 'function') {
        app.View[vKey].listen();
      }
    }
  };

}(Backbone, _));