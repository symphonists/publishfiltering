(function($, Symphony) {
	'use strict';

	Symphony.Language.add({
		'Click to select': false,
		'Type to search': false,
		'You are viewing a filtered entry index.': false,
		'Clear': false,
		'Clear?': false,
		'Search for {$item}': false
	});

	$(document).on('ready.publishfiltering', function() {
		var contents = $('#contents'),
			notifier = $('div.notifier'),
			button = $('a[href="#drawer-publishfiltering"]'),
			options = Symphony.Context.get('publishfiltering');

		var Publishfiltering = function() {
			var filter, fields, comparison, search,
				comparisonSelectize, searchSelectize, fieldsSelectize;

			var init = function(context) {
				filter = $(context);
				fields = filter.find('.publishfiltering-fields');
				comparison = filter.find('.publishfiltering-comparison');
				search = filter.find('.publishfiltering-search');

				// Setup interface
				fields.selectize().on('change', switchField);
				comparison.selectize().on('change', searchEntries);
				search.addClass('init').selectize({
					create: true,
					maxItems: 1,
					render: {
						item: itemPreview,
						option_create: searchPreview
					}
				}).on('change', searchEntries);

				// Store Selectize instances
				fieldsSelectize = fields[0].selectize;
				comparisonSelectize = comparison[0].selectize;
				searchSelectize = search[0].selectize;

				// Clear search
				filter.on('mousedown.publishfiltering', '.destructor', clear);

				// Finish initialisation
				search.removeClass('init');
			};

			var switchField = function() {
				var field = fieldsSelectize.getValue();

				// Clear
				searchSelectize.clearOptions();

				// Default options
				if(hasOptions(field)) {
					comparisonSelectize.setValue('is');
					searchSelectize.$control_input.attr('placeholder', Symphony.Language.get('Click to select') + '…');
					$.each(options[field], function(key, option) {
						var value = (typeof key === 'string') ? key : option;

						searchSelectize.addOption({
							value: value,
							text: option
						});
					});
				}

				// Text search
				else {
					comparisonSelectize.setValue('contains');
					searchSelectize.$control_input.attr('placeholder', Symphony.Language.get('Type to search') + '…');
				}		
			};

			var searchPreview = function(item) {
				return '<div class="create"><em>' + Symphony.Language.get('Search for {$item}', {item: item.input}) + ' …</em></div>';
			};

			var itemPreview = function(item, escape) {
				return '<div class="item">' + escape(item.text) + '<a href="' + location.href.replace(location.search, '') + '" class="destructor">' + Symphony.Language.get('Clear') + '</a></div>';
			};

			var searchEntries = function(event) {
				if(!search.is('.init')) {
					var filters = buildFilters(),
						base, url;

					// Fetch entries
					if(filters != '') {
						base = location.href.replace(location.search, '');
						url = base + '?' + filters;

						fetchEntries(url);
						setURL(url);
					}
				}
			};

			var buildFilters = function() {
				var filters = [];

				$('.publishfiltering-row').each(function() {
					var row = $(this),
						fieldVal = row.find('.publishfiltering-fields').val(),
						comparisonVal = row.find('.publishfiltering-comparison').val(),
						searchVal = row.find('.publishfiltering-search').val(),
						filterVal, method;

					if(fieldVal && searchVal) {
						method = (comparisonVal === 'contains') ? 'regexp:' : '';
						filterVal = 'filter[' + encodeURI(fieldVal) + ']=' + method + encodeURI(searchVal);
						filters.push(filterVal);
					}
				});

				return filters.join('&');
			}

			var fetchEntries = function(url) {
				$.ajax({
					url: url,
					dataType: 'html',
					success: appendEntries
				});
			};

			var appendEntries = function(result) {
				var page = $(result),
					entries = page.find('tbody'),
					pagination = page.find('ul.page'),
					pageform = page.find('.paginationform'),
					pagegoto = pageform.find('input'),
					pageactive = pagegoto.attr('data-active'),
					pageinactive = pagegoto.attr('data-inactive');

				// Update entry table
				contents.find('tbody').replaceWith(entries);

				// Update pagination, see symphony/assets/js/admin.js
				contents.find('ul.page').remove();
				contents.append(pagination);
				pagegoto
					.val(pageinactive)
					.on('focus.admin', function() {
						if(pagegoto.val() === pageactive) {
							pagegoto.val('');
						}
						pageform.addClass('active');
					})
					.on('blur.admin', function() {
						if(pageform.is('.invalid') || pagegoto.val() === '') {
							pageform.removeClass('invalid');
							pagegoto.val(pageinactive);
						}
						if(pagegoto.val() === pageinactive) {
							pageform.removeClass('active');
						}
					}
				);
				pageform
					.attr('action', window.location.href)
					.on('mouseover.admin', function() {
						if(!pageform.is('.active') && pagegoto.val() === pageinactive) {
							pagegoto.val(pageactive);
						}
					})
					.on('mouseout.admin', function() {
						if(!pageform.is('.active') && pagegoto.val() === pageactive) {
							pagegoto.val(pageinactive);
						}
					})
					.on('submit.admin', function() {
						if(parseInt(pagegoto.val(), 10) > parseInt(pagegoto.attr('data-max'), 10)) {
							pageform.addClass('invalid');
							return false;
						}
					}
				);
			};

			var setURL = function(url) {
				if(!!(window.history && history.pushState)) {
					history.pushState(null, null, url);
				}
			};

			var clear = function(event) {
				event.preventDefault();
				if(searchSelectize.isLocked) return;

				searchSelectize.clear();
			};

			var hasOptions = function(name) {
				return name in options;
			};

			// API
			return {
				init: init,
				clear: clear
			};
		};

		// Notify about filtering
		button.on('init.publishfiltering click.publishfiltering', function notifyFilter() {
			if(location.search.indexOf('filter') !== -1) {
				if(button.is('.selected')) {
					$('header .filtered').trigger('detach.notify');
				}
				else {
					notifier.trigger('attach.notify', [Symphony.Language.get('You are viewing a filtered entry index.') + ' <a href="' + location.href.replace(location.search, '') + '">' + Symphony.Language.get('Clear?') + ' </a>', 'filtered']);
				}
			}
		}).trigger('init.publishfiltering');

		// Init filter interface
		$('.publishfiltering-row').each(function() {
			var filtering = new Publishfiltering();
			filtering.init(this);
		});
	});

})(window.jQuery, window.Symphony);
