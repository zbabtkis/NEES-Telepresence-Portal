define([
	  'backbone'
	, 'jquery'
	, 'Model/ScreenshotDataSource'
	, 'backbone.kendowidget',
	, 'domReady'], 

function(Backbone, $, ScreenshotDataSource) {
	var PlayButton = Backbone.View.extend({
		tagName: 'i',
		initialize: function() {
			if(this.model) {
				this.listenTo(this.model, 'change:framerate', this._getState);
				this._getState();
			}

			return this;
		},
		events: {
			'click': '_playPause'
		},
		_playPause: function() {
			// Check current state and change it.
			this.set('framerate', this.get('framerate') ? 0 : 1);

			return this;
		},
		_getState: function() {
			// If framerate slider changes from play to pause, only render change for button.
			if(this.model.get('framerate') !== 0) {
				this.$el.attr('class', 'icon-pause icon icon-2x');
			} else  {
				this.$el.attr('class', 'icon-play icon icon-2x');
			}

			return this;
		}
	});

	var FullSizeButton = Backbone.View.extend({
		tagName: 'i',
		className: 'icon-fullscreen icon icon-2x',
		events: {
			'click': 'toggle'
		},
		toggle: function() {
			var val = this.model.get('fullSize') ? false : true;
			this.model.set('fullSize', val);

			return this;
		}
	});

	var FramerateFlipper = Backbone.KendoWidget.extend({
		el: '#framerate-selector',
		options: {
			min: 0,
			max: 10,
			decimals: 0,
			format: "# fps"
		},
		widget: 'kendoNumericTextBox',
		dataBind: 'framerate'
	});

	var SnapshotTool = Backbone.View.extend({
		tagName: 'i',
		className: 'icon icon-camera icon-2x',
		attributes: {
			alt: 'Capture snapshot',
			title: 'Capture snapshot'
		},
		events: {
			'click': '_snapshot'
		},
		initialize: function() {
			if(this.model) {
				this.listenTo(this.options.model, 'change:isOn', this.enable);
			}
		},
		render: function() {
			$('.video-controls').append(this.$el);
			this.enable(this.model);

			return this;
		},
		_snapshot: function() {
			var url = this.model.get('media').split('?')[0]  + '/screenshot?socketID=' + Telepresence.socket.socket.sessionid;
			this.model.trigger('flash');
			$.getJSON(url);

			return this;
		},
		enable: function(isActive, tValue) {
			if(isActive === true || tValue === true) {
				this.delegateEvents();
				this.$el.css({
					'color': '#000',
					'cursor': 'pointer'
				});
			} else {
				this.$el.css({
					'color': '#999',
					'cursor': 'default'
				});
				this.undelegateEvents();
			}

			return this;
		}
	});

	var DownloadSnapshots = Backbone.View.extend({
		tagName: 'i',
		className: 'icon icon-download-alt icon-2x',
		attributes: {
			alt: 'Download snapshots',
			title: 'Download snapshots'
		},
		events: {
			'click': '_getFile'
		},
		initialize: function() {
			var _this = this;

			ScreenshotDataSource.bind('change', function() {
				_this.enable(ScreenshotDataSource.data().length > 0);
			});
		},
		render: function() {
			$('.video-controls').append(this.$el);
			this.enable(false);

			return this;
		},
		_getFile: function() {
			window.open(Telepresence.nodeServer + 'screenshots/retrieve?socketID=' + Telepresence.socket.socket.sessionid);

			return this;
		},
		enable: function(isActive) {
			if(isActive) {
				this.delegateEvents();
				this.$el.css({
					'color': '#000',
					'cursor': 'pointer'
				});
			} else {
				this.undelegateEvents();
				this.$el.css({
					'color': '#999',
					'cursor': 'default'
				});
			}

			return this;
		}
	});

	var ScreenshotGrid = Backbone.KendoWidget.extend({
		el: '#screenshots',
		options: {
			dataSource: ScreenshotDataSource,
	        pageable: {
	            refresh: true,
	            pageSizes: true
	        },
	        columns: [
	        	{
	                field: "title",
	                width: 90,
	                title: "Camera"
	            } , {
	                field: "time",
	                width: 90,
	                title: "Time"
	            }
	        ]
		},
		widget: 'kendoGrid'
	});

	var StatefulControls = new Object();
	var NonStatefulControls = new Object();

	return {
		initialize: function(model) {

			StatefulControls.playButton   = new PlayButton({ model: model });
			StatefulControls.fullScreenButton  = new FullSizeButton({ model: model });
			StatefulControls.framerateFlipper  = new FramerateFlipper({ model: model });
			StatefulControls.snapshotTool = new SnapshotTool({ model: model }).render();
			NonStatefulControls.Download = NonStatefulControls.Download || new DownloadSnapshots({ model: model }).render();
			NonStatefulControls.Snapshot = NonStatefulControls.Snapshot || new ScreenshotGrid({ model: model });


			return StatefulControls;
		},
		destroy: function() {
			_.each(StatefulControls, function(control) {
				control.remove();
			});
		}
	}
});
