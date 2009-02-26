$(document).ready(function() {
	var options = '<option value="">' + filters_label + '</option>';
	
	for (var item in filters) {
		options = options + '<option value="' + filters[item] + '">' + item + '</option>';
	}
	
	$('h2').after('\
		<form class="filters" method="POST" action="">\
			<select class="field" name="field">' + options + '</select>\
			<input class="value" name="value" />\
			<input type="submit" value="' + filters_button + '" />\
		</form>\
	');
	
	$('.filters').submit(function() {
		var self = $(this);
		var field = self.find('.field').val();
		var value = self.find('.value').val();
		
		if (field && value) {
			self.attr(
				'action', '?filter='
				+ field	+ ':' + value
			);
			return true;
			
		} else if (field || value) {
			return false;
		}
		
		self.attr('action', '?');
	});
});