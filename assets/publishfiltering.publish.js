Symphony.Language.add({
	'contains': false,
	'equals': false,
	'Filter': false,
	'Clear filters': false,
	'entry': false,
	'entries': false,
});

var PublishTabs = {
	
	fields: Symphony.Context.get('publishfiltering').fields,
	filters: Symphony.Context.get('publishfiltering').filters,
	
	comparisons: {
		'equals': Symphony.Language.get('equals'),
		'contains': Symphony.Language.get('contains')
	},
	
	allow_multiple: true,
	
	buildFilterRow: function(filter) {
		var self = this;
		
		// if no filter passed, substitute with a basic object
		// to allow an empty filter row to be created
		if(!filter) filter = {};
		
		var row = jQuery('<div class="filter" />').appendTo(this.form);
		
		var select_field = jQuery('<select class="field" name="field" />').appendTo(row);
		var select_comparison = jQuery('<select class="comparison" name="comparison" />').appendTo(row);
		
		for (var i in this.fields) {
			var option = jQuery('<option/>')
							.text(this.fields[i].label)
							.attr('value', this.fields[i].handle)
							.appendTo(select_field);
			if(this.fields[i].handle == filter.handle) {
				option.attr('selected', 'selected');
			}
		}
		
		for (var comparison in this.comparisons) {
			var option = jQuery('<option />')
							.text(this.comparisons[comparison])
							.attr('value', comparison)
							.appendTo(select_comparison);
		}
		
		// rebuild value input/select when changing field
		select_field.bind('change', function() {
			self.buildFilterValueInput(row, filter);
			self.setComparison(row, filter);
			self.disableActiveFields();
			self.appendApplyButton(row);
		});
		
		select_comparison.bind('change', function() {
			self.buildFilterValueInput(row, filter);
			self.appendApplyButton(row);
		});
		
		// build initial value input/select
		self.buildFilterValueInput(row, filter);
		self.setComparison(row, filter);
		
		if(filter.handle) {
			self.appendRemoveButton(row);
		} else {
			row.addClass('new');
			self.appendApplyButton(row);
		}
		
		row.find('.value').bind('keydown', function() {
			self.appendApplyButton(row);
		});
		
		row.find('.value').bind('change', function() {
			self.appendApplyButton(row);
		});
		
	},
	
	appendRemoveButton: function(row) {
		var self = this;
		
		if(!this.allow_multiple) return;
		
		row.find('.remove').remove();
		
		var remove = jQuery('<span class="remove" title="Remove this filter">&#215;</span>');
		remove.bind('click', function() {
			row.addClass('disabled');
			self.form.submit();
		});
		row.prepend(remove);
	},
	
	appendApplyButton: function(row) {
		var self = this;
		
		row.find('.apply').remove();
		
		var apply = jQuery('<input type="submit" class="apply" value="Filter" />');
		apply.bind('click', function() {
			self.form.submit();
		});
		row.append(apply);
	},
	
	init: function() {
		var self = this;
		
		// build initial DOM containers
		this.form = jQuery('<form class="publishfiltering" method="get" action=""></form>');
		
		// add a filter row for any existing filters in the querystring
		for(var i in this.filters) this.buildFilterRow(this.filters[i]);
		
		// add first filter row if none exist
		if(this.allow_multiple || this.filters.length == 0) this.buildFilterRow();
		
		this.disableActiveFields();
		
		// add the container to the page
		jQuery('#contents > h2:first').after(this.form);
		
		this.form.bind('submit', function(e) {
			e.preventDefault();
			
			var href = '';
			jQuery(this).find('.filter:not(.disabled)').each(function() {
				var handle = jQuery(this).find('.field').val();
				var comparison = jQuery(this).find('.comparison').val();
				var value = jQuery(this).find('.value').val();
				if(!value) return;
				href += 'filter[' + handle + ']=' + ((comparison == 'contains') ? 'regexp:' : '') + window.encodeURI(value) + '&';
			});
			
			href = href.replace(/&$/, '');
			//if(href.length > 0)
			window.location.href = '?' + href;
			
		});
		
		var $pagination = jQuery('ul.page');
		var count = 0;
		if ($pagination.length) {
			var title = $pagination.find("li[title]").attr('title');
			var digits = title.match(/[0-9]+/g);
			count = digits[digits.length - 1];
		} else {
			// if there are no entries, there will be one row but its first td will be inactive
			jQuery('tbody tr').each(function() {
				if (!jQuery('td:first', this).hasClass('inactive')) count++;
			});
		}

		var h2 = jQuery('h2 > span:first');
		h2.after('<span class="publishfiltering inactive">' + count + ' ' +  ((count == 1) ? Symphony.Language.get('entry') : Symphony.Language.get('entries')) + '</span>');
		
		
	},
	
	disableActiveFields: function() {
		var self = this;
		
		var active_fields = [];
		this.form.find('select.field').each(function() {
			if(jQuery(this).parent().hasClass('new')) return;
			active_fields.push(jQuery(this).val());
		});
		
		this.form.find('select.field').each(function() {
			
			jQuery(this).find('option').removeAttr('disabled');
			
			var selected_value = jQuery(this).val();
			for(var i in active_fields) {
				var handle = active_fields[i];
				if(handle == selected_value) continue;
				jQuery(this).find('option[value="'+handle+'"]').attr('disabled', 'disabled');
			}
			
		});
		
	},
	
	buildFilterValueInput: function(row, filter) {
		
		var field_handle = row.find('.field option:selected').val();
		var comparison = row.find('.comparison');
		
		for (var i in this.fields) {
			if(this.fields[i].handle == field_handle) field = this.fields[i];
		}
		
		// remove existing value input
		row.find('.value').remove();
		
		if (field.options.length > 0) {
			
			var value_input = jQuery('<select name="value" class="value" />');
			
			for (var i in field.options) {
				
				var option_label = field.options[i].label ? field.options[i].label : field.options[i];
				var option_value = field.options[i].value ? field.options[i].value : field.options[i];
				
				var option = jQuery('<option/>')
								.text(option_label)
								.attr('value', option_value)
								.appendTo(value_input);

				if (option_value == filter.value) option.attr('selected', 'selected');
				
			}
			
		} else {
			
			var value_input = jQuery('<input name="value" class="value" />').val(filter.value);
			
		}
		
		comparison.after(value_input);
		value_input.focus()
		
	},
	
	setComparison: function(row, filter) {
		
		var field_handle = row.find('.field option:selected').val();
		var comparison = row.find('.comparison');
		
		for (var i in this.fields) {
			if(this.fields[i].handle == field_handle) field = this.fields[i];
		}
		
		// if the value is a dropdown, select "equals"
		if(row.find('.value').is('select')) {
			comparison.find('option[value="equals"]').attr('selected', 'selected');
		}
		// if the filter is already set and has a (regexp) prefix, select "contains"
		else if(filter.prefix) {
			comparison.find('option[value="contains"]').attr('selected', 'selected');
		}
		// if the field type supports regular expressions
		else if(field.type.match(/(taglist|textbox|input|textarea|upload|reflection)/) || field.type.match(/(textbox)$/)) {
			comparison.find('option[value="contains"]').attr('selected', 'selected');
		}
		else {
			comparison.find('option[value="equals"]').attr('selected', 'selected');
		}
		
	}
	
};

jQuery(document).ready(function() {
	PublishTabs.init();
});