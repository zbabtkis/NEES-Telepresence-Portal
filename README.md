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
This module comes pre-configured to connect to the UCSB NEES video feed, so just install it in Drupal and navigate to /nvf2

If you need to use this app to access another stream, follow the instructions in app.settings.js in the js folder. You'll be up and running with just a few modifactions to the JSON object!

Requirements
------------
* TPS Proxy Server with RESTful API and compatible webcam.
* Drupal 7.x
* Javascript

About
-----
The NEES Telepresence module is written in Javascript and PHP using the Backbone, Underscore and jQuery libraries and the Drupal CMS framework.
