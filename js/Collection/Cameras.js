define([
    'Model/Camera'
  , 'app.settings'
  , 'underscore'
  , 'backbone'],

  function(Camera, settings) {
    var Cameras, cameras;

    Cameras = Backbone.Collection.extend({
      model: Camera,
      // Load site views from app.Settings -- set when site is chosen or updated.
      updateList: function (site_id) {
        var cams = settings.cameras,
            items = [],
            i;

        for(i in cams) {
          // Grab views that are associated with site location by site_id property.
          if(cams[i].site_id === site_id) {
            var cam = new Camera(cams[i]);

            items.push(cam);
          }
        }

        // Reset the SiteViewCollection with new set of views.
        this.reset(items);
      }
    });

    cameras = new Cameras();

    return cameras;
  }
);