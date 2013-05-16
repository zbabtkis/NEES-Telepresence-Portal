define(['underscore', 'backbone', 'domReady'], function() {
	'use strict';

	var ActionButton;

	ActionButton = Backbone.View.extend({
		tagName: 'button',
		className: function() {
			var value = this.options.value ? this.options.value : 'action';
			return 'camera-action ' + this.options.action + '-' + value;
		},
		defaults: {
			'title': 'Camera Action',
			'action': 'none',
			'value': 'none'
		},
		// Semantic robotic commands.
		attributes: function() {
			return {
				'data-action': this.options.action,
				'data-value': this.options.value,
				'alt': this.options.title,
				'title': this.options.title
			};
		}
	});

	return ActionButton;
})