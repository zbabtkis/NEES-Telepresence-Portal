var app = window.app || (window.app = {});

// Holds site information to render in map and list views.
(function () {

  'use strict';

  app.Settings = {
    // Gmaps initial rendering options
    map: {
      options: {
        center: new google.maps.LatLng(33.3, -116.0),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.HYBRID
      }
    },
    // Locations loaded in map or main list view.
    locations: [
      {
        loc: "Garner Valley SFSI Field Site",
        site_id: 1,
        position: new google.maps.LatLng(33.0974, -115.531)
      },
      {
        loc: "Wildlife Liquefaction Array",
        site_id: 2,
        position: new google.maps.LatLng(33.669, -116.674)
      }
    ],
    // Site specific views that get loaded when user clicks site.
    views: [
      {
        loc: "Garner Valley SFSI Field Site",
        type: "Full-Size",
        title: "Full-Size",
        site_id: 1
      },
      {
        loc: "Garner Valley SFSI Field Site",
        type: "Inside",
        title: "Inside",
        site_id: 1
      },
      {
        loc: "Wildlife Liquefaction Array",
        type: "Full-Size",
        title: "Full-Size",
        site_id: 2
      },
      {
        loc: "Wildlife Liquefaction Array",
        type: "Internal - when personnel onsite",
        title: "Internal - when personnel onsite",
        site_id: 2
      }
    ]
  };
}());