Symphony.Language.add({
	'contains': false,
	'is': false,
	'Apply': false,
	'Clear': false,
	'entry': false,
	'entries': false
});

var PublishTabs = {

	drawer: null,

	$select_field: null,
	$select_comparison: null,
	$value_input: null,

	active_field: null,

	active_filter: {
		'handle': null,
		'value': null,
		'is_regex': false
	},

	fields: Symphony.Context.get('publishfiltering'),

	comparisons: {
		'contains': Symphony.Language.get('contains'),
		'is': Symphony.Language.get('is')
	},

	init: function() {
		var self = this;

		this.drawer = jQuery('#drawer-publish-filtering');

		this.drawer.bind('expandstop.drawer', function() {
			self.drawer.find('input[type="text"]:first').focus();
		});

		// get active filter from querystring
		var filter_querystring = window.location.href.match(/\?filter\[(([^:]+)\]=(.*))?/);
		if (filter_querystring && filter_querystring[3] != undefined) {
			this.active_filter.handle = window.decodeURI(filter_querystring[2]);
			this.active_filter.value = window.decodeURI(filter_querystring[3]);
		}

		// remove regex from value if it exists
		if (this.active_filter.value && this.active_filter.value.indexOf('regexp') != -1) {
			this.active_filter.is_regex = true;
			this.active_filter.value = this.active_filter.value.replace(/regexp:/,'');
		}

		// build initial DOM containers
		var $form = jQuery('<form class="publishfiltering" method="get" action="" />');
		this.$select_field = jQuery('<select class="field" name="field" />');
		this.$select_comparison = jQuery('<select class="comparison" name="comparison" />');
		var $input_filter = jQuery('<input type="text" />');
		var $input_apply = jQuery('<input class="apply" type="submit" value="' + Symphony.Language.get("Apply") + '" />');
		var $input_reset = jQuery('<button class="clear"><span>' + Symphony.Language.get("Clear") + '</span></button>');

		var i = 0;
		for (var label in this.fields) {
			var field = this.fields[label];
			var $option = jQuery('<option/>').text(label).attr('value', field.handle);

			if(this.active_filter.handle == null && i == 0) this.active_filter.handle = field.handle;

			if (this.active_filter.handle == field.handle) {
				$option.attr('selected', 'selected');
				this.active_field = field;
			}

			this.$select_field.append($option);
			i++;
		}

		for (var comparison in this.comparisons) {
			var $option = jQuery('<option />').text(this.comparisons[comparison]).attr('value', comparison);

			if(
				(comparison == 'contains' && this.active_filter.is_regex) ||
				(comparison == 'is' && !this.active_filter.is_regex && this.active_filter.value)
			) {
				$option.attr('selected', 'selected');
			}
			this.$select_comparison.append($option);
		}

		this.$select_comparison.bind('change', function() {
			self.$value_input.focus();
		});

		this.$select_field.bind('change', function() {
			var handle = jQuery(this).val();
			self.renderValueInput(handle, true);
			self.$value_input.focus();
		});

		$input_reset.bind('click', function(e) {
			e.preventDefault();
			window.location.href = window.location.href.replace(/\?.*/, '');
		});

		$form.bind('submit', function(e) {
			e.preventDefault();

			var handle = self.$select_field.val();
			var value = self.$value_input.val();
			var comparison = self.$select_comparison.val();

			if (handle && value) {
				var href = '?filter[' + encodeURI(handle) + ']=';
				if (comparison == 'contains') href += 'regexp:';
				href += encodeURI(value);
				window.location.href = href;
			}

			return false;
		});

		$form
			.append(this.$select_field)
			.append(this.$select_comparison)
			.append($input_apply)
			.append($input_reset)

		this.drawer.find('.contents').empty().append($form);

		this.renderValueInput(this.active_filter.handle, false);

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

		var h2 = jQuery('#breadcrumbs h2');
		h2.after('<span class="publishfiltering inactive">' + count + ' ' +  ((count == 1) ? Symphony.Language.get('entry') : Symphony.Language.get('entries')) + '</span>');

	},

	renderValueInput: function(handle, from_interaction) {

		var field = null;
		var $value_input = null;

		if (this.$value_input) this.$value_input.remove();

		for (var label in this.fields) {
			if (this.fields[label].handle == handle) field = this.fields[label];
		}

		if (field == null) return;

		if (field.options) {

			if(from_interaction) this.$select_comparison.val('is');

			$value_input = jQuery('<select name="value" class="value" />')

			for (var option in field.options) {

				var option_label = field.options[option].label ? field.options[option].label : field.options[option];
				var option_value = field.options[option].value ? field.options[option].value : field.options[option];

				var $option = jQuery('<option/>').text(option_label).attr('value', option_value);

				if (option_value == this.active_filter.value) {
					$option.attr('selected', 'selected');
				}

				$value_input.append($option);

			}

		} else {

			if(from_interaction) this.$select_comparison.val('contains');

			$value_input = jQuery('<input type="text" name="value" class="value" />').val(this.active_filter.value);

		}

		this.$value_input = $value_input;
		this.$select_comparison.after(this.$value_input);

	}

};

jQuery(document).ready(function() {
	PublishTabs.init();
});
