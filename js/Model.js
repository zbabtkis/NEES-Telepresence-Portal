var FeedModel = Backbone.Model.extend({
	initialize: function() {
		this.on('change', this.updateURL);
	},
	defaults: {
		'baseUrl': 'http://tpm.nees.ucsb.edu/feeds/',
	},
	updateURL: function() {
		this.set('uri', this.get('loc') + '/' + this.get('type'));
		this.set('requestAddr', this.get('baseUrl') + this.get('uri'));
		this.set('robotic', this.get('requestAddr') + '/robotic')
	},
});

var MenuModel = Backbone.Model.extend({
	defaults: {
		'title' : 'Full-Size',
		'loc'   : 'Garner Valley Downhole Array',
		'type'  : 'Full-Size',
		'site_id' : 1,
	},
});
var SiteModel = Backbone.Model.extend({
	defaults: {
		'loc': 'Garner Valley Downhole Array',
		'id': 0,
	}
});

var FrameRateModel = Backbone.Model.extend({
	defaults: {
		'value': 6, // Initial value on framerate slider
		'max'  : 10, // Max on framerate slider
	}
});


/** Handles Robotic Actions */
var ControllerModel = Backbone.Model.extend({
	defaults: {
		'lastCall': null, // Not in use now, but we might want to have some sort of undo function.
	},
	updateRobotHandler: function(feed) {
		// Updates the camera url to send action requests to.
		this.set('handler', feed.attributes.robotic);
	},
	robotCommand: function(method, value) {
		// Calls action handlers.
		this['__' + method](value);
	},
	__iris: function(value) {
		var that 	= this,
			actions = ['close', 'open', 'auto']; // Only accept these actions
		if(actions.indexOf(value) != -1) {
			if(value == 'close' || value == 'open') { var pre = 'r' } else { var pre = ''}; // Non automatic commands (i.e. close and auto) must be prefixed by 'r' in the GET action.
			jQuery.ajax({
				url: that.get('handler'),
				data: {'ctrl': pre + 'iris', 'value': value}, // Format should be http://tps.nees.ucsb.edu/path/to/site/view/robot?ctrl=[action]&value=[value]
				dataType: 'jsonp', // We don't need a returned value for now, and this will allow Cross-Domain HTTPRequest until we add CORS header to robotic script.
				complete: function() {
					console.log('iris ' + value + ' complete.');
				},
			});
			return this;
		} else {
			console.log('invalid iris action given.');
		}
	},
	__focus: function(value) {
		var that 	= this,
			actions = ['near', 'far', 'auto'];
		if(actions.indexOf(value) != -1) {
			if(value == 'near' || value == 'far') { var pre = 'r' } else { var pre = ''};
			jQuery.ajax({
				url: that.get('handler'),
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
	__zoom: function(value) {
		var that 	= this,
			actions = ['in', 'out'];
		if(actions.indexOf(value) != -1) {
			jQuery.ajax({
				url: that.get('handler'),
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
	__tilt: function(value) {
		var that 	= this,
			actions = ['up', 'down'];
		if(actions.indexOf(value) != -1) {
			jQuery.ajax({
				url: that.get('handler'),
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
	__pan: function(value) {
		var that 	= this,
			actions = ['right', 'left'];
		jQuery.ajax({
			url: that.get('handler'),
			data: {'ctrl': 'rpan', 'value': value},
			dataType: 'jsonp',
			complete: function() {
				console.log('pan ' + value + ' complete.');
			},
		});
		return this;
	},
	__home: function() {
		var that = this;
		jQuery.ajax({
			url: that.get('handler'),
			data: {'ctrl': 'home'},
			dataType: 'jsonp',
			complete: function() {
				console.log('home centering complete.');
			},
		});
		return this;
	},
});