var FeedModel = Backbone.Model.extend({
	initialize: function() {
		this._location = this.attributes.loc;
		this._size = this.attributes.size;
		this.base_url = 'http://tpm.nees.ucsb.edu/feeds/';
		this._uri = this._location + '/' + this._size;
		this.requestAddr = this.base_url + this._uri;
	},
});

var MenuModel = Backbone.Model.extend({
	initialize: function() {
		this.attributes.title;
		this.attributes.loc;
		this.attributes.type;
		this.attributes.site_id;
	},
});
var SiteModel = Backbone.Model.extend({
	initialize: function() {
		this.attributes.loc;
		this.attributes.id;
	}
});