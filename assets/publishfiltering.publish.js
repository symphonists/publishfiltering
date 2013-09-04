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

		var Publishfiltering = function() {
			var contents = $('#contents'),
				notifier = $('div.notifier'),
				button = $('a[href="#drawer-publishfiltering"]'),
				drawer = $('#drawer-publishfiltering'),
				fields = drawer.find('.publishfiltering-fields'),
				comparison = drawer.find('.publishfiltering-comparison'),
				search = drawer.find('.publishfiltering-search'),
				options = Symphony.Context.get('publishfiltering'),
				comparisonSelectize, searchSelectize, fieldsSelectize;

			var init = function() {
				fields.selectize().on('change', switchField);
				comparison.selectize().on('change', searchEntries);
				search.selectize({
					plugins: ['restore_on_backspace'],
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
				drawer.on('mousedown.publishfiltering', '.destructor', clear);

				// Restore filter from URL
				restoreFilter();

				// Notify about filtering
				button.on('init.publishfiltering click.publishfiltering', notifyFilter).trigger('init.publishfiltering');
			};

			var restoreFilter = function() {
				if(location.search.indexOf('filter') !== -1) {
					var filter = location.search.substring(1).split('&');
					$.each(filter, function(key, value) {
						if(value.indexOf('filter') === 0) {
							value = decodeURIComponent(value);
							var settings = value.match(/filter\[(.*)\]=(regexp:)?(.*)/);
							fieldsSelectize.setValue(settings[1]);

							// Add existing options to selection 
							if(settings[2] === 'regexp:') {
								searchSelectize.addOption({
									value: settings[3],
									text: settings[3]
								});
							}

							searchSelectize.setValue(settings[3]);
						}
					});
				}
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

			var searchEntries = function() {
				var field = fieldsSelectize.getValue(),
					comparison = comparisonSelectize.getValue(),
					needle = searchSelectize.getValue(),
					base, method, url;

				// Fetch entries
				if(field && needle) {
					base = location.href.replace(location.search, '');
					method = (comparison === 'contains') ? 'regexp:' : '';
					url = base + '?filter[' + encodeURI(field) + ']=' + method + encodeURI(needle);

					fetchEntries(url);
					setURL(url);
				}
			};

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

			var clear = function() {
				searchSelectize.clear();
				searchSelectize.clearOptions();
				window.location.href = location.href.replace(location.search, '');
			};

			var hasOptions = function(name) {
				return name in options;
			};

			var notifyFilter = function() {
				if(location.search.indexOf('filter') !== -1) {
					if(button.is('.selected')) {
						$('header .filtered').trigger('detach.notify');
					}
					else {
						notifier.trigger('attach.notify', [Symphony.Language.get('You are viewing a filtered entry index.') + ' <a href="' + location.href.replace(location.search, '') + '">' + Symphony.Language.get('Clear?') + ' </a>', 'filtered']);
					}
				}
			};

			// API
			return {
				init: init,
				clear: clear
			};
		}();

		// Init filter interface
		Publishfiltering.init();
	});

})(window.jQuery, window.Symphony);
