$(document).ready(function() {
	var options = '';
	
	for (var item in filters) {
		options = options + '<option value="' + filters[item] + '">' + item + '</option>';
	}
	
	$('h2').after('\
		<form class="filters" method="POST" action="">\
			' + filters_label + '\
			<select class="field" name="field">' + options + '</select> = \
			<input class="value" name="value" />\
			<input type="submit" value="' + filters_button + '" />\
		</form>\
	');
	
	$('.filters').submit(function() {
		var self = $(this);
		
		self.attr(
			'action', '?filter='
			+ self.find('.field').val()
			+ ':' + self.find('.value').val()
		);
	});
});