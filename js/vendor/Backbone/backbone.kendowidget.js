define(['backbone', 'kendo'], function(Backbone) {
	Backbone.KendoWidget = Backbone.View.extend({
		initialize: function() {
			var _this = this, widget;

			var widget = this.getElement();

			this.$el.html(widget);

			widget = widget[this.widget](this.options).data(this.widget);

			if(widget.enable) {
				widget.enable(false);

				if(this.model) {
					widget.value(this.model.get(this.dataBind));

					widget.bind('change', function(e) {
						var value = e.value || e._value || e.sender._value;

						_this.model.set(_this.dataBind, value);
						console.log(_this.model.toJSON(), value);
					});

					this.model.on('change:' + this.dataBind, function(model, value) {
						widget.value(value);
					});

					this.model.on('change:isOn', function(model, isOn) {
						widget.enable(true);
					});
				}
			}

			if(widget.dataSource) {
				widget.dataSource.read();
			}
		},
		getElement: function() {
			switch(this.widget) {
				case 'kendoSlider':
					return $('<div />', { id: 'widget-' + this.boundTo });
				case 'kendoNumericTextBox':
					return $('<input />', { id: 'widget-' + this.boundTo });
				case 'kendoDropDownList':
					return $('<input />', { id: 'widget-' + this.boundTo });
				default:
					return $('<div />', { id: 'widget-' + this.boundTo });
			}
		},
		remove: function() {
			this.undelegateEvents();
			if(this.$el.data(this.widget)) {
				this.$el.data(this.widget).remove();
			}
			delete this.model;
		}
	});

	return Backbone.KendoWidget;
});