var MenuCollection = Backbone.Collection.extend({
	model: MenuModel,
	initialize: function() {
		this.add([
			{loc:"Garner Valley SFSI Field Site",type:"Full-Size",title:"Full-Size",site_id: 1},
			{loc:"Garner Valley SFSI Field Site",type:"Inside",title:"Inside", site_id: 1},
			{loc:"Wildlife Liquefaction Array",type:"Full-Size",title:"Full-Size", site_id: 2},
			{loc:"Wildlife Liquefaction Array",type:"Internal - when personnel onsite",title:"Internal - when personnel onsite", site_id: 2}
		]);
	}
});
var SiteCollection = Backbone.Collection.extend({
	model: SiteModel,
	initialize: function() {
		this.add([
			{loc:"Garner Valley SFSI Field Site",id: 1},
			{loc:"Wildlife Liquefaction Array",id: 2},
		]);
	}
});

var MenuElementCollection = Backbone.Collection.extend({
	views: MenuElement
});

var SiteElementCollection = Backbone.Collection.extend({
	views: SiteElement
});