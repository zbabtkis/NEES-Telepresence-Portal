define(['libs/backbone','underscore'], function($) {
	var MenuListView, CameraListView, MenuElement,
		SiteElement, Tabs, MenuHeader;

/**..j) MenuListView */
	MenuListView = Backbone.View.extend({
		el: '#sub-menu',
		render: function(c) {
			var $parent, that = this;

			this.$el.html('');

			// Make sure sub-menu contains links.
			if(c.models[0]) {
				var siteLinks = $('.site-link');

				$('.site-link.active').removeClass('active');

				// Get parent li element form matching site location in model.
				$parent = siteLinks.filter(function() {
					var f = $(this).data('siteLoc') == c.models[0].get('loc');
					return f;
				})
				$parent.addClass('active');
				this.$el.insertAfter($parent);
			}

			app.Model.SiteViews.forEach(function(item) {
				var newMenu = new MenuElement(item.attributes);
				that.$el.append(newMenu.$el);
			});
		},
		listen: function() {
			this.listenTo(app.Model.SiteViews, 'reset', this.render);
		}
	});
/**..k) MenuElement */			
	MenuElement = Backbone.View.extend({
		tagName: 'li',
		className: 'feed-link',
		attributes: function(){
			return {
				'data-loc': this.options.loc,
				'data-type': this.options.title
			};
		},
		initialize: function() {
			var self = this;
			var title = this.options.title;
			this.$el.html(title);
		},
		events: {
			'click' : 'openFeed'
		},
		openFeed: function() {
			var loc = this.$el.data('loc');
			var type = this.$el.data('type');
			app.Router.navigate('sites/' + loc + '/' + type, {trigger: true});
		}
	});
/**..l) SiteElement */
	SiteElement = Backbone.View.extend({
		tagName: 'li',
		className: 'site-link',
		attributes: function(){
			return {
				'data-site-loc': this.options.loc
			};
		},
		events: {
			'click': 'openViews'
		},
		openViews: function(e) {
			if(this.el = e.target) {
				var loc = this.options.loc;

				app.Router.navigate('sites/' + loc, {trigger: true});
			}
		},
		initialize: function() {
			var title = this.options.loc;
			this.$el.html(title);
		}
	});
/**..n) Menu Header */
	MenuHeader = Backbone.View.extend({
		el: "#menu-header",
		events: {
			'click': 'toggle'
		},
		initialize: function() {
			this.on('changeMenu', this.changeHeading);
		},
		toggle: function() {
			app.View.Menu.trigger('toggleMenu');
		},
		changeHeading: function(v) {
			$("#menu-header h4").html(v);
		}
	});
}(jQuery));