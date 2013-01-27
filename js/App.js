var App = Backbone.Router.extend({
		initialize: function() {
			this.addViews();
		},
		routes: {
			'': 'index',
			'feed/:loc/:type': 'feed',
			'map':'map'
		},
		feed: function(loc, type) {
			this.TPSView.frames = new FrameView({loc: loc, type: type});
			this.TPSView.frames.render();
		},
		index: function() {
			console.log('routes initialized');
		},
		map: function() {
			
		},
		addViews: function() {
			this.TPSView = new MainView();
			var menus = this.TPSView.menus;
		},
});


Drupal.behaviors.nvf2 = {
	attach: function() {
		TPSApp = new App();
		Backbone.history.start();
	},
};