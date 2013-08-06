define([
	  'Collection/Cameras'
	, 'View/Time'
	, 'spin'
	, 'backbone'
	, 'underscore'
	, 'jquery'
	, 'domReady'],	

	function(Cameras, Time, Spinner, Backbone, _, $) {
	'use strict';

	var Stream;

	Stream = Backbone.View.extend({
		el: '#stream',
		events: {
			'click .reload': 'reload',
            'click': 'getPosition'
		},
		initialize: function() {
			_.bindAll(this
				, 'render'
				, 'load'
				, 'error'
				, 'flash'
				, 'promptReload'
				, 'reload'
				, 'getPosition');
			
			// Awesome spinny preloader provided by spin.js :).
			this.spinner = new Spinner({
				color:'#222'
			});

			this.time = new Time({model: this.model});

			this.model.on({
				'change:framerate': this.render,
				'change:isOn': this.promptReload,
				'flash': this.flash
			}, this);

			return this;
		},
		render: function() {
			var framerate = this.model.get('framerate'),
				socketInfo = '?random=' + Math.random() + '&socketID=' + Telepresence.socket.socket.sessionid,
				image;

			image = $('<img />', {
				className: 'stream-image',
				src: this.model.url() + '/' + framerate + socketInfo
			});

			this.$el.removeClass('stream-ended');

			this.$el.html(image);
			this.spinner.spin(this.el);

			image.on({
				load: this.load,
				error: this.error
			});
		},
		load: function() {
			this.spinner.stop();
			this.model.set('isOn', true);
			this.$el.append(this.time.$el);
		},
		error: function() {
			this.spinner.stop();
			this.model.set('isOn', false);
			this.$el.html("<h1 class='telepresence-message'>Unable to load stream</h1>");
			this.time.stop();
		},
		flash: function() {
			var vingette = $("<div class='flash' />");
			vingette.appendTo(this.$el)
				.delay(100)
				.fadeOut('fast', function() {
					this.remove();
				});
		},
		promptReload: function(model, isOn) {
			if(isOn === false) {
				this.time.stop();
				this.$el.addClass('stream-ended');
				this.$el.prepend("<img class='reload' src='http://openclipart.org/image/800px/svg_to_png/171074/reload-icon.png' />");
			}
			this.delegateEvents();
		},
		reload: function() {
			this.$el.removeClass('stream-ended');
			this.model.loadMedia();
			this.delegateEvents();
			this.time.start();
		},
        getPosition: function(e) {
            var target = $(e.currentTarget),
                width  = target.width(),
                height = target.height(),
                offset = target.offset(),
                left   = e.pageX - offset.left,
                top    = e.pageY - offset.top,
                x, y;

            x = 100 * left / width;
            y = 100 * top / height;
            
            this.model.center(x, y);
        }
	});

	return Stream;
});