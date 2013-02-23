var SiteViewCollection = Backbone.Collection.extend({
	model: SiteViewModel,
	updateViewsList: function(siteId) {
		var newViews = [];
		for(var i in TPSApp.Settings.views) {
			if(TPSApp.Settings.views[i].site_id == siteId) {
				newViews.push(TPSApp.Settings.views[i]);
			}
		}
		console.log(newViews);
		this.reset(newViews);
	}
});
var SiteCollection = Backbone.Collection.extend({
	model: SiteModel,
	addLocationsFromSettings: function() {
		this.add(TPSApp.Settings.locations);
	},
});

var MenuElementCollection = Backbone.Collection.extend({
	views: MenuElement
});

var SiteElementCollection = Backbone.Collection.extend({
	views: SiteElement
});