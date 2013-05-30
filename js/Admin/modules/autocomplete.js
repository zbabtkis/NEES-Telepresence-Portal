Mojul('autocomplete', ['jquery'], function($) {
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
});