define(['underscore','backbone'], function($) {
	'use strict';

	var Sites, sites;

	Sites = Backbone.View.extend({
		tagName: 'section',
		id: 'sites',
		initialize: function() {
			var that = this;
			
			this.$parent = $('#telepresence-dashboard');
			_.bindAll(this);

			require(['text!Templates/Sites.jtpl'], function(tpl) {
				that.template = _.template(tpl);
			});
		},
		render: function() {
			var that = this;

			require(['Collection/Sites'], function(sites) {
				var html = that.template(sites);
				that.$el.html(html);
			});
			this.$parent.html(this.$el);
			return this;
		}
	});


	return {
		initialize: function() {
			sites = new Sites();
		},
		render: function() {
			if(!sites) {
				this.initialize();
			} else {
				sites.render();
			}
		}
	}
}(jQuery));