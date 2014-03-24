<?php
	
	class Extension_PublishFiltering extends Extension {
		
		private $_incompatible_publishpanel = array('mediathek', 'imagecropper', 'readonlyinput');
		private $_form = null;
		private $_fields = array();
		private $_options = array();
		
		public function getSubscribedDelegates() {
			return array(
				array(
					'page'		=> '/backend/',
					'delegate'	=> 'InitaliseAdminPageHead',
					'callback'	=> 'createInterface'
				)
			);
		}

		/**
		 * Append publish filtering interface
		 */
		public function createInterface($context) {
			$callback = Symphony::Engine()->getPageCallback();

			if($callback['driver'] == 'publish' && $callback['context']['page'] == 'index') {
				$this->getFields($callback['context']['section_handle']);

				// Append assets
				Administration::instance()->Page->addScriptToHead(URL . '/extensions/publishfiltering/assets/selectize.js', 1001);
				Administration::instance()->Page->addStylesheetToHead(URL . '/extensions/publishfiltering/assets/publishfiltering.publish.css', 'screen', 1002);
				Administration::instance()->Page->addScriptToHead(URL . '/extensions/publishfiltering/assets/publishfiltering.publish.js', 1003);
				Administration::instance()->Page->addElementToHead(new XMLElement(
					'script',
					"Symphony.Context.add('publishfiltering', " . json_encode($this->_options) . ")",
					array('type' => 'text/javascript')
				), 1004);

				// Append drawer
				Administration::instance()->Page->insertDrawer(
					Widget::Drawer('publishfiltering', __('Filter Entries'), $this->createDrawer())
				);
			}
		}

		/**
		 * Create drawer
		 */
		public function createDrawer() {
			$filters = $_GET['filter'];
			$this->form = Widget::Form(null, 'get', 'publishfiltering');

			// Create existing filters
			if(is_array($filters) && !empty($filters)) {
				foreach($filters as $field => $search) {
					$this->createFilter($field, $search);
				}
			}

			// Create empty filter
			else {
				$this->createFilter();
			}

			return $this->form;
		}

		public function createFilter($field = null, $search = null) {
			$row = new XMLElement('div');
			$row->setAttribute('class', 'publishfiltering-row');

			// Fields
			$fields = $this->_fields;
			for($i = 1; $i < count($fields); $i++) {
				if($fields[$i][0] === $field) {
					$fields[$i][1] = true;
				}
			}

			$div = new XMLElement('div', null, array('class' => 'publishfiltering-controls'));
			$div->appendChild(
				Widget::Select('fields', $fields, array(
					'class' => 'publishfiltering-fields'
				))
			);

			// Comparison
			$needle = str_replace('regexp:', '', $search);
			$div->appendChild(
				Widget::Select('comparison', array(
					array('contains', (strpos($search, 'regexp:') !== false), __('contains')),
					array('is', (strpos($search, 'regexp:') === false), __('is'))
				), array(
					'class' => 'publishfiltering-comparison'
				))
			);
			$row->appendChild($div);

			// Search
			$row->appendChild(
				Widget::Input('search', $needle, 'text', array(
					'class' => 'publishfiltering-search',
					'placeholder' => __('Type to search') . ' …')
				)
			);

			$this->form->appendChild($row);				
		}

		/**
		 * Get field names
		 */
		public function getFields($section_handle) {
			$sectionManager = new SectionManager(Symphony::Engine());
			$section_id = $sectionManager->fetchIDFromHandle($section_handle);
			
			if(!$section_id) return;			

			// Filterable sections
			$section = $sectionManager->fetch($section_id);
			foreach($section->fetchFilterableFields() as $field) {
				if(in_array($field->get('type'), $this->_incompatible_publishpanel)) continue;

				$this->_fields[] = array($field->get('element_name'), false, $field->get('label'));
				$this->getFieldOptions($field);
			}
		}

		/**
		 * Get default field options
		 */
		public function getFieldOptions($field) {
			if(method_exists($field, 'getToggleStates')) {
				$options = $field->getToggleStates();
				if(!empty($options)) $this->_options[$field->get('element_name')] = $options;

			}
			if(method_exists($field, 'findAllTags')) {
				$options = $field->findAllTags();
				if(!empty($options)) $this->_options[$field->get('element_name')] = $options;
			}
		}

	}
	
?>