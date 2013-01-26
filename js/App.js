var App = Backbone.Model.extend({
		initialize: function() {
			this.addViews();
		},
		addViews: function() {
			this.TPSFeedView = new FeedView();
			var menus = this.TPSFeedView.menus;
		},
});

Drupal.behaviors.nvf2 = {
	attach: function() {
		TPSApp = new App();
	},
};
