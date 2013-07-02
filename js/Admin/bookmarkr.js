define(['jquery', 'kendo', 'domReady'], function($, kendo) {
	"use strict";

	var Saver = (function() {

		var API = '/admin/telepresence/bookmark';


		return {
			save: function(id, position, title) {
				$.ajax({
					url: API,
					type: 'POST',
					data: {'id': id, 'position': position, 'title': title},
					dataType: 'json',
					success: function(data) {
						Telepresence.socket.emit('requestGlobalUpdate', data.id);
					},
					fail: function() {
						alert('there was an error saving the bookmark');
					}
				})
			},
			delete: function(id, title) {
				$.ajax({
					url: API,
					type: 'DELETE',
					data: {'id': id, 'title': title},
					success: function(response) {
						data = JSON.parse(response);

						if(data.message === 'success') {
							alert("Camera " + title + ' successfully deleted.');
						}
					}
				})
			}
		}
	}());

	var Bookmarkr = function() {
		var camera = Telepresence.API.getPosition();

		if(camera) {
			var $bookmarkr = $('<div class="bookmarker" />')
				.html('<label for="bookmark-title">Location Name: </label><input id="bookmark-title" /><button class="save btn btn-primary">Save</button>');

			$('#telepresence-wrap').append($bookmarkr);

			$bookmarkr.animate({top:0});

			$bookmarkr.click(function(e) {
				e.stopPropagation();
			});

			$bookmarkr.on('click', '.save', save);
		}

		function save() {
			var title  = $bookmarkr.find('#bookmark-title').val();

			if(camera) {
				Saver.save(camera.id, camera.position, title);
			}

			close();
		}

		$('body').on('click', close);

		function close() {
			$bookmarkr.animate({top: -150}, function() {
				$bookmarkr.remove();
			});
			$('body').off('click', close);
		}

		return {
			close: close
		}
	}

	var Bookmark = {
		attr: {
			tagName: 'div',
			className: 'bookmark'
		},
		events: {
			click: function(e) {
				var b = new Bookmarkr();

				e.stopPropagation();
			}
		},
		initialize: function(widget) {
			this.el = document.createElement(this.attr.tagName);
			this.el.className = this.attr.className;

			this.widget = widget;

			this.$el = $(this.el);

			return this;
		},
		render: function() {
			var $parent = $('#telepresence-wrap'),
				_this = this;
			
			$parent.append(this.$el);

			this.$el.on(this.events);

			var $remover = $('<i class="icon icon-minus-sign icon-2x bRemover"></i>');

			$('#location-picker').parent().append($remover);


			$remover.click(function() {
				var camera = Telepresence.API.getPosition();

				Saver.delete(camera.id, _this.widget.value());
			});

			return this;
		}
	};

	return {
		initialize: _.bind(Bookmark.initialize, Bookmark)
	};
});