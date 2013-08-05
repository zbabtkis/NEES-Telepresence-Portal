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
			var _this = this;

			this.start();

			this.model.on('change:isOn', function(model, val) {
				val ? _this.start() : _this.stop();
				console.log(val);
			});
		},
		stop: function() {
			clearInterval(this.interval);
		},
		start: function() {
			var _this = this;

			this.interval = setInterval(function() {
				var curr = _this.getPacificTime().toString();
				_this.$el.html(curr);
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