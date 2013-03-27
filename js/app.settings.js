/**
 --------------------------------------------------------------------
      Nees Telepresence -- App Settings
 --------------------------------------------------------------------
 ********************************************************************
 --------------------------------------------------------------------
                Contents          
 --------------------------------------------------------------------
 1. BaseURL -- sets the base feed URL.
 2. locations -- you can add locations here for your monitoring sites.
 3. views -- location specific camera views.
 --------------------------------------------------------------------
 */

var app = window.app || (window.app = {});

// Holds site information to render in map and list views.
(function () {

  'use strict';

  app.Settings = {
    // FlexTPS RESTful server base URL.
    baseURL: 'http://tpm.nees.ucsb.edu/feeds/',
    // Locations loaded in map or main list view.
    locations: [
      {
        // Display purposes only.
        loc: "Garner Valley SFSI Field Site",
        // For associating a site with its camera views - you can 
        // use any number.
        site_id: 1,
      },
      {
        loc: "Wildlife Liquefaction Array",
        site_id: 2,
      }
    ],
    // Site specific views that get loaded when user clicks site.
    views: [
      {
        // This is the name that will be used in the request to 
        // the REST server. */
        loc: "Garner Valley SFSI Field Site",
        // This will also appear in the REST request.
        type: "Full-Size",
        // Display purposes only.
        title: "Full-Size",
        // Associate with location of site_id 1.
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