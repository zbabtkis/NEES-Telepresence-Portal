moj.delete = ('delete', ['jquery'], function($, api) {
	$('.camera-delete').bind('click', function() {
		var row = $(this).parent().parent(),
			id = row.find('.id').html(),
			sure = false;

		var sure = confirm("Are you sure you want to delete this camera?");

		if(sure) {
			$.ajax({
				url: api + '/' + id,
				type: 'DELETE',
				complete: function(data) {
					console.log(data);
					row.remove();
				}
			});
		}
	});
});