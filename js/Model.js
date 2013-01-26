var FeedModel = Backbone.Model.extend({
	initialize: function() {
		this._location = this.attributes.loc;
		this._size = this.attributes.size;
		this.base_url = 'http://tpm.nees.ucsb.edu/feeds/';
		this._uri = this._location + '/' + this._size;
		this._requestAddr = this.base_url + this._uri;
		console.log(this);
	},
	getFeed: function() {
		jQuery('#vnf-video-wrapper').append('<img src="' + this._requestAddr + '">');
	},
	getJpeg: function() {
		this._type = 'jpeg';
		this._requestAddr += '/' + this._type;
		this.getFeed();
	}
});

var MenuModel = Backbone.Model.extend({
	initialize: function() {
		this.attributes.title;
		this.attributes.loc;
		this.attributes.type;
	},
});
