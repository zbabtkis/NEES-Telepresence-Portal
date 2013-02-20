var FeedModel = Backbone.Model.extend({
	initialize: function() {
		this.on('change', this.updateURL);
	},
	updateURL: function() {
		this.location = this.get('loc');
		this.size = this.get('type');
		this.base_url = 'http://tpm.nees.ucsb.edu/feeds/';
		this.uri = this.location + '/' + this.size;
		this.requestAddr = this.base_url + this.uri;
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

var ControllerModel = Backbone.Model.extend({
	defaults: {
		'lastCall': null,
	},
	iris: function(value) {
		var actions = ['close', 'open', 'auto'];
		if(actions.indexOf(value) != -1) {
			if(value == 'close' || value == 'open') { var pre = 'r' } else { var pre = ''};
			var url = window.TPSApp.frame.feedModel.base_url + window.TPSApp.frame.feedModel.uri + '/robotic';
			jQuery.ajax({
				url: url,
				data: {'ctrl': pre + 'iris', 'value': value},
				dataType: 'jsonp',
				complete: function() {
					console.log('iris ' + value + ' complete.');
				},
			});
			return this;
		} else {
			console.log('invalid iris action given.');
		}
	},
	focus: function(value) {
		var actions = ['near', 'far', 'auto'];
		if(actions.indexOf(value) != -1) {
			if(value == 'near' || value == 'far') { var pre = 'r' } else { var pre = ''};
			var url = window.TPSApp.frame.feedModel.base_url + window.TPSApp.frame.feedModel.uri + '/robotic';
			jQuery.ajax({
				url: url,
				data: {'ctrl': pre + 'focus', 'value': value},
				dataType: 'jsonp',
				complete: function() {
					console.log('focus ' + value + ' complete.');
				},
			});
			return this;
		} else {
			console.log('invalid focus action given.');
		}
	},
	zoom: function(value) {
		var actions = ['in', 'out'];
		if(actions.indexOf(value) != -1) {
			var url = window.TPSApp.frame.feedModel.base_url + window.TPSApp.frame.feedModel.uri + '/robotic';
			jQuery.ajax({
				url: url,
				data: {ctrl: 'rzoom', value: value},
				dataType: 'jsonp',
				complete: function() {
					console.log('zoom ' + value + ' complete.');
				},
			});
			return this;
		} else {
			console.log('invalid zoom action given.');
		}
	},
	tilt: function(value) {
		var actions = ['up', 'down'];
		if(actions.indexOf(value) != -1) {
			var url = window.TPSApp.frame.feedModel.base_url + window.TPSApp.frame.feedModel.uri + '/robotic';
			jQuery.ajax({
				url: url,
				data: {'ctrl': 'rtilt', 'value': value},
				dataType: 'jsonp',
				complete: function() {
					console.log('tilt ' + value + ' complete.');
				},
			});
			return this;
		} else {
			console.log('invalid tilt action given.');
		}
	},
	pan: function(value) {
		var actions = ['right', 'left'];
		var url = window.TPSApp.frame.feedModel.base_url + window.TPSApp.frame.feedModel.uri + '/robotic';
		jQuery.ajax({
			url: url,
			data: {'ctrl': 'rpan', 'value': value},
			dataType: 'jsonp',
			complete: function() {
				console.log('pan ' + value + ' complete.');
			},
		});
		return this;
	},
	home: function() {
		var url = window.TPSApp.frame.feedModel.base_url + window.TPSApp.frame.feedModel.uri + '/robotic';
		jQuery.ajax({
			url: url,
			data: {'ctrl': 'home'},
			dataType: 'jsonp',
			complete: function() {
				console.log('home centering complete.');
			},
		});
		return this;
	},
});