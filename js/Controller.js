var FeedCollection = Backbone.Collection.extend({
	model: FeedModel
});

var MenuCollection = Backbone.Collection.extend({
	model: MenuModel,
	initialize: function() {
		this.add([
			{loc:"Garner Valley SFSI Field Site",type:"Full-Size",title:"Full-Size"},
			{loc:"Garner Valley SFSI Field Site",type:"Inside",title:"Inside"},
			{loc:"Wildlife Liquefaction Array",type:"Full-Size",title:"Full-Size"},
			{loc:"Wildlife Liquefaction Array",type:"Internal - when personnel onsite",title:"Internal - when personnel onsite"}
		]);
	}
});

var MenuElementCollection = Backbone.Collection.extend({
	views: MenuElement
});

var TPSRoutes = Backbone.Router.extend({
		routes: {
			'': 'index',
			'feed/:id': 'renderFeed',
		},
		renderFeed: function(id) {
			console.log('rendered id ' + id);
		},
		index: function() {
			console.log('routes initialized');
		},
});
