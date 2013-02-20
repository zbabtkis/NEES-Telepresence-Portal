var FeedModel = Backbone.Model.extend({
	initialize: function() {
		this.on('change', this.updateURL);
	},
	updateURL: function() {
		this._location = this.get('loc');
		this._size = this.get('type');
		this.base_url = 'http://tpm.nees.ucsb.edu/feeds/';
		this._uri = this._location + '/' + this._size;
		this.requestAddr = this.base_url + this._uri;
	}
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

var FrameRateModel = Backbone.Model.extend({
	defaults: {
		'value': 6,
	}
});