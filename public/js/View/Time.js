define([
	  'jquery'
	, 'underscore'
	, 'backbone'
	, 'datejs'
	, 'domReady'],

function($, _, Backbone) {
	var Time = Backbone.View.extend({
		tagName: 'span',
		id: 'time-display',
		initialize: function() {
			this.start();
		},
		stop: function() {
			clearInterval(this.interval);
		},
		start: function() {
			var _this = this;

			this.interval = setInterval(function() {
				var curr = _this.getPacificTime();
				_this.$el.html(curr.toString());
			}, 1000);
		},
		getPacificTime: function() {
			var date = new Date();

			date.setTimezone("PDT");

			return date;
		}
	});

	return Time;
});