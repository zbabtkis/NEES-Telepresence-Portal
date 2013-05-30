Backbone.KendoWidget = Backbone.View.extend({
	initialize: function() {
		var _this = this, widget;

		widget = this.$el[this.widget](this.options).data(this.widget);

		widget.bind('change', function(e) {
			var obj = {
				boundTo: _this.dataBind,
				action: _this.actionBind,
				value: (e.value || e._value || e.sender._value)
			};

			Telepresence.debug('A kendo widget value has changed',e);

			_this.trigger('valueChange', obj);
		});

		// Controls should be disabled by default.
		widget.enable(false);

		this.enable = function() {
			widget.enable(true);
		}
		this.disable = function() {
			widget.enable(false);
		}
		this.value = function(val) {
			widget.value(val);
		}
	}
});