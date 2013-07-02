(function() {
	'use strict'

	// Framework Stuff.

	var exports = [];

	function module(require, func) {
	  	for(var i = 0; i < require.length; i++) {
			require[i] = exports[require[i]]();
		}

		exports[func].apply(this, require);
	}

	// Attach modules to admin form.

	Drupal.behaviors.telepresence = {
		attach: function() {
			var editor = new module(['jQuery'], 'editor');
			var autocomplete = new module(['jQuery'], 'autocomplete');
			var deleter = new module(['jQuery', 'api'], 'delete');
		}
	}

	// Admin modules.

	exports.jQuery = function() {
		return jQuery;
	}

	exports.api = function() {
		return '/telepresence/api/cameras';
	};

	exports.editor = function($) {
		$('.camera-edit').bind('click', function() {
			var items = $(this).parent().parent().find('td');

			items.each(function() {
				var selector = $(this).attr('class'),
					match    = $('input[name=' + selector + ']'),
					value    = $(this).html();

				match.val(value);
			});

		});

		return this;
	};

	exports.autocomplete = function($) {
		var sites = [],
			safe_name = [];

		$('.site_name').each(function() {
			var val = $(this).html()

			if($.inArray(val, sites) == -1) {
				sites.push(val);
			}
		});

		$('.site_safe_name').each(function() {
			var val = $(this).html()

			if($.inArray(val, safe_name) == -1) {
				safe_name.push(val);
			}
		});

		if(sites.length > 0) {
			$('#edit-site-name').autocomplete({source: sites});
		}

		if(safe_name.length > 0) {
			$('#edit-site-safe-name').autocomplete({source: safe_name});
		}
	};

	exports.delete = function($, api) {
		$('.camera-delete').bind('click', function() {
			var row = $(this).parent().parent(),
				id = row.find('.id').html(),
				sure = false,
				url = api + '/' + id;

			var sure = confirm("Are you sure you want to delete this camera?");

			if(sure) {
				$.ajax({
					url: url,
					type: 'DELETE',
					complete: function(data) {
						row.slideUp('slow');
					}
				});
			}
		});
	};

})();