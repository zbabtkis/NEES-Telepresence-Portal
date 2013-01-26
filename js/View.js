var FeedView = Backbone.View.extend({
	initialize: function() {
		this.feeds = new FeedCollection();
		this.nav = new MenuListView();
		this.render();
	},
	setControls: function() {
		jQuery('#vnf-video-wrapper').append('<img src="' + this._requestAddr + '">');
	},
	render: function() {
    this.$el = jQuery("#TPS-Viewer");
    this.$el.append(this.nav.$el);
	}
});

var MenuListView = Backbone.View.extend({
		initialize: function() {
			this.menus = new MenuCollection();
			this.children = new MenuElementCollection();
			this.render();
		},
		tagName: 'ul',
		render: function() {
			self = this;
			menus = this.menus;
			var els = '';
			menus.forEach(function(item) {
				self.children.add(new MenuElement({menu:item}));
			});
			this.children.forEach(function(li) {
					self.$el.append(li.attributes.$el);
			});
		}
});
		
var MenuElement = Backbone.View.extend({
		tagName: 'li',
		className: 'feed-link',
		attributes: function(){
			return {
				'data-loc': this.options.menu.attributes['loc'],
				'data-type': this.options.menu.attributes['type'],
			};
		},
		initialize: function() {
			var title = this.options.menu.attributes['title'];
			var type = this.options.menu.attributes['type'];
			var loc = this.options.menu.attributes['loc'];
			this.$el.html(title);
			this.$el.bind('click', function() {
					that = new FeedModel({loc:loc,size:type});
					that.getJpeg();
			});
		}
});
