(function($) {

	$(document).on('ready.publishfiltering', function() {
		var publishfiltering = $('#drawer-publishfiltering'),
			fields = publishfiltering.find('.publishfiltering-fields'),
			comparison = publishfiltering.find('.publishfiltering-comparison'),
			search = publishfiltering.find('.publishfiltering-search'),
			options = Symphony.Context.get('publishfiltering'),
			selectize;

		// System messages


		// Search
		search.selectize({
			// create: true,
			maxItems: 1
		});
		selectize = search[0].selectize;

		// Fields
		fields.selectize({
			onChange: function(value) {
				selectize.clearOptions();
				$.each(options[value], function(key, option) {
					selectize.addOption({value: key, text: option});
				})
			}
		});

		// Comparison
		comparison.selectize();
	});

})(window.jQuery);