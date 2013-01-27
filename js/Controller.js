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