NEES Telepresence Portal
========================

A portal for streaming and controlling live video feeds from UCSB NEES sites. It can be used for any flexTPS based IP webcam streaming.

Features
--------
* Pan, tilt, zoom, focus, and more.
* Full screen mode.
* Pause and download screenshots.
* Bookmarkable.

Installation
------------
This module comes pre-configured to connect to the UCSB NEES video feed, so just install it in Drupal and navigate to /telepresence

If you need to use this app to access another stream, follow the instructions in app.settings.js in the js folder. You'll be up and running with just a few modifactions to the JSON object!

Requirements
------------
* TPS Proxy Server with RESTful API and compatible webcam.
* Drupal 7.x
* Javascript

Languages
---------

The NEES Telepresence module is written in Javascript and PHP using the Backbone, Underscore and jQuery libraries and the Drupal CMS framework.

Organization
------------

The app uses a Model View Controller organization pattern. All Views are located in app.View, all Models and Collections are in app.Model and the router is in app.Router.

Almost every html element has its own view object with various methods attached to it as well as listeners that detect changes in the app Model. Since Backbone prefers that controller logic goes in Views, the View objects each contain their own controller logic as well. Backbone uses the events property of each View object to detect view based events like clicks, mouseovers etc.

The router controls the general state of the app. This allows users to navigate directly to a state in the app or travel back through history without interacting with the application.

Technology
----------

###Camera Angle Canvas
The camera angle selector view uses the HTML5 canvas to paint a circular graph with a pointer that tracks the users mouse around the canvas and sends click coordinates to Robot model to change the camera angle.
###Loading Spinner
The loading animation is built with a spin.js spinner. Spin.js is a jQuery plugin that adds loading gif like functionality with better performance, more options and mobile compatibility.

Todo
----

- [ ] Convert to Handlebar template?
- [ ] Add camera control slideout to full screen view.

More Information
----------------

*[http://www.backbonejs.org Backbone]
*[http://www.underscorejs.org Underscore]
*[http://diveintohtml5.info/canvas.html Article on Using HTML5 Canvas]
*[http://fgnass.github.com/spin.js/ Spin.js]
