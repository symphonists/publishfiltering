$(document).ready(function() {
	var options = '<option value="">' + filters_label + '</option>';
	var matches = location.href.match(/\?filter=(([^:]+):(.*))?/);
	var field = ''; var value = '';
	
	if (matches && matches[3] != undefined) {
		field = unescape(matches[2]);
		value = unescape(matches[3]);
	}
	
	for (var item in filters) {
		var selected = '';
		
		if (field == filters[item]) selected = ' selected="selected"';
		
		options = options + '<option' + selected + ' value="' + filters[item] + '">' + item + '</option>';
	}
	
	$('h2').after('\
		<form class="filters" method="POST" action="">\
			<select class="field" name="field">' + options + '</select>\
			<input class="value" name="value" value="' + value + '" />\
			<input class="apply" type="submit" value="' + filters_apply + '" />\
			<input class="clear" type="button" value="' + filters_clear + '" />\
		</form>\
	');
	
	$('.filters .field').change(function() {
		$('.filters .value').focus();
	});
	
	$('.filters .clear').click(function() {
		location.href = location.href.replace(/\?.*/, '');
		
		return false;
	});
	
	$('.filters').submit(function() {
		var self = $(this);
		var field = self.find('.field').val();
		var value = self.find('.value').val();
		
		if (field && value) {
			location.href = '?filter=' + escape(field) + ':' + escape(value);
		}
		
		return false;
	});
});