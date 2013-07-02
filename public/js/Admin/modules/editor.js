Mojul('editor', ['jquery'], function($) {
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
});