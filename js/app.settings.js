define(function () {

  'use strict';

  var Settings = {
    // FlexTPS RESTful server base URL.
    baseURL: 'http://tpm.nees.ucsb.edu/feeds/',
    // Locations loaded in map or main list view.
    locations: [
      {
        // Display purposes only.
        loc: "Garner Valley SFSI Field Site",
        safe_name: "gvda",
      },
      {
        loc: "Wildlife Liquefaction Array",
        safe_name: "wla",
      }
    ],
    // Site specific views that get loaded when user clicks site.
    cameras: [
      {
        // This is the name that will be used in the request to 
        // the REST server. */
        site_id: "gvda",
        loc: "Garner Valley SFSI Field Site",
        // This will also appear in the REST request.
        type: "Full-Size",
        // Display purposes only.
        title: "Full-Size",
        id: "full-size",
      },
      {
        site_id: "gvda",
        loc: "Garner Valley SFSI Field Site",
        type: "Inside",
        title: "Inside",
        id: "inside",
      },
      {
        site_id: "wla",
        loc: "Wildlife Liquefaction Array",
        type: "Full-Size",
        title: "Full-Size",
        id: 'full-size',
      },
      {
        site_id: "wla",
        loc: "Wildlife Liquefaction Array",
        type: "Internal - when personnel onsite",
        title: "Internal - when personnel onsite",
        id: 'internal',
      }
    ]
  };

  return Settings;
});