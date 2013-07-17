define(['underscore', 'backbone', 'jquery', 'toggle'],

function(_, Backbone, $, ToggleSwitch) {
	var toggleControls = new ToggleSwitch();

	toggleControls.render().$el.appendTo('#app');

	return toggleControls;
});