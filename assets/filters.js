$(document).ready(function() {
	var options = '<option value="">' + filters_label + '</option>';
	var matches = location.href.match(/filter=(([^:]+):(.*))?/);
	var field = ''; var value = '';
	
	var regex = false;
	var regex_prefix = 'regexp';
	var comparison_options = '';
	var comparisons = ['is', 'contains'];
	
	if (matches && matches[3] != undefined) {
		field = unescape(matches[2]);
		value = unescape(matches[3]);
	}
	
	if (value.indexOf(regex_prefix) != -1) {
		regex = true;
		value = value.replace(/regexp:/,'');
	}
	
	for (var item in filters) {
		var selected = '';
		
		if (field == filters[item]) selected = ' selected="selected"';
		
		options += '<option' + selected + ' value="' + filters[item] + '">' + item + '</option>';
	}	
	
	for (var i = 0; i < comparisons.length; i++) {
		var selected = '';
		
		if (comparisons[i] == 'contains' && regex) selected = ' selected="selected"';		
		
		comparison_options += '<option' + selected + '>' + comparisons[i] + '</option>';
	}
	
	$('h2').after('\
		<form class="filters" method="POST" action="">\
			<select class="field" name="field">' + options + '</select>\
			<select class="match" name="match">' + comparison_options + '</select>\
			<input class="value" name="value" value="' + value + '" />\
			<input class="apply" type="submit" value="' + filters_apply + '" />\
			<input class="clear" type="button" value="' + filters_clear + '" />\
		</form>\
	');
	
	$('.filters select').change(function() {
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
			var href = '?filter=' + escape(field) + ':';
			if (self.find('.match').val() == 'contains') href += regex_prefix + ':';
			href += escape(value);
			location.href = href;
		}
		
		return false;
	});
});