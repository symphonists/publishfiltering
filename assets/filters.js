Symphony.Language.add({
	'contains': false,
	'is': false,
	'Filter': false,
	'Clear filters': false,
	'entry': false,
	'entries': false,
});

jQuery(document).ready(function() {

	var options = '';
	var matches = location.href.match(/\?filter=(([^:]+):(.*))?/);
	var field = ''; var value = '';
	
	var filters = Symphony.Context.get('publish-filtering')
	
	var regex = false;
	var regex_prefix = 'regexp';
	var comparison_options = '';
	var comparisons = [Symphony.Language.get('contains'), Symphony.Language.get('is')];
	
	var selected_field = null;
	
	if (matches && matches[3] != undefined) {
		field = decodeURI(matches[2]);
		value = decodeURI(matches[3]);
	}
	
	if (value.indexOf(regex_prefix) != -1) {
		regex = true;
		value = value.replace(/regexp:/,'');
	}
	
	for (var item in filters) {
		var selected = '';
		var handle = filters[item].handle;
		if (field == handle) {
			selected = ' selected="selected"';
			selected_field = filters[item];
		}
		
		options += '<option' + selected + ' value="' + handle + '">' + item + '</option>';
	}	
	
	for (var i = 0; i < comparisons.length; i++) {
		var selected = '';
		
		if (comparisons[i] == Symphony.Language.get('contains') && regex) selected = ' selected="selected"';
		if (comparisons[i] == Symphony.Language.get('is') && !regex && value) selected = ' selected="selected"';
		
		comparison_options += '<option' + selected + '>' + comparisons[i] + '</option>';
	}
	
	function buildValueControl() {
		
		if (selected_field && selected_field.options) {
			
			jQuery('.filters select.match').val(Symphony.Language.get('is'));
			
			var select = '<select name="value" class="value">';
			
			for (var i=0; i < selected_field.options.length; i++) {
				var selected = '';
				var option_label = selected_field.options[i].label ? selected_field.options[i].label : selected_field.options[i];
				var option_value = selected_field.options[i].value ? selected_field.options[i].value : selected_field.options[i];
				
				if (option_value == value) selected = ' selected="selected"';
				
				select += '<option value="' + option_value + '"' + selected + '>' + option_label + '</option>';
			}
			
			select += '</select>';
			return select;
			
		} else {
			jQuery('.filters select.match').val(Symphony.Language.get('contains'));
			return '<input class="value" name="value" value="' + value + '" />';
		}
		
	}
	
	jQuery('.wrapper > .contents > h2').after('\
		<form class="filters" method="POST" action="">\
			<select class="field" name="field">' + options + '</select>\
			<select class="match" name="match">' + comparison_options + '</select>' + buildValueControl() + '<input class="apply" type="submit" value="' + Symphony.Language.get("Filter") + '" />\
			<button class="clear"><span>' + Symphony.Language.get("Clear filters") + '</span></button>\
		</form>\
	');
	
	jQuery('.filters select').change(function() {
		jQuery('.filters .value').focus();
	});
	
	jQuery('.filters select.field').change(function() {
		var value = jQuery(this).attr('value');
		for(var item in filters) {
			if (value == filters[item].handle) selected_field = filters[item];
		}
		
		jQuery('.filters .value').remove();
		jQuery('.filters .match').after(buildValueControl());
		jQuery('.filters .value').focus();
	});
	
	jQuery('.filters .clear').click(function() {
		location.href = location.href.replace(/\?.*/, '');
		
		return false;
	});
	
	jQuery('.filters').submit(function() {
		var self = jQuery(this);
		var field = self.find('.field').val();
		var value = self.find('.value').val();

		if (field && value) {
			var href = '?filter=' + encodeURI(field) + ':';
			if (self.find('.match').val() == Symphony.Language.get('contains')) href += regex_prefix + ':';
			href += encodeURI(value);
			location.href = href;
		}
		
		return false;
	});
	
	var pagination = jQuery('ul.page');
	var count = 0;
	if (pagination.length) {
		var title = pagination.find("li[title]").attr('title');
		var digits = title.match(/[0-9]+/g);
		count = digits[digits.length - 1];
	} else {
		// if there are no entries, there will be one row but its first td will be inactive
		jQuery('tbody tr').each(function() {
			if (!jQuery('td:first', this).hasClass('inactive')) count++;
		});
	}
	
	var h2 =jQuery('#contents > h2 > span:first');
	var h2_text = h2.text();
	h2.text(h2_text += ' (' + count + ' ' +  ((count == 1) ? Symphony.Language.get('entry') : Symphony.Language.get('entries')) + ')');
	
});