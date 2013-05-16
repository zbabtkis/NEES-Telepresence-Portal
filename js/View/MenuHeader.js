define(['underscore', 'backbone'], function() {
	var Header, header;
	Header = Backbone.View.extend({
		el: "#menu-header",
		events: {
			'click': 'toggle'
		},
		initialize: function() {
			this.on('changeMenu', this.changeHeading);
		},
		toggle: function() {
			app.View.Menu.trigger('toggleMenu');
		},
		changeHeading: function(v) {
			$("#menu-header h4").html(v);
		}
	});

	return Header;
});