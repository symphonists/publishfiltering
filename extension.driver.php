<?php
	
	class Extension_PublishFiltering extends Extension {
		
		private $_incompatible_publishpanel = array('mediathek', 'imagecropper', 'readonlyinput');
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
			$form = Widget::Form(null, 'get', 'publishfiltering');
			$div = new XMLElement('div', null, array('class' => 'publishfiltering-controls'));
			$div->appendChild(
				Widget::Select('fields', $this->_fields, array(
					'class' => 'publishfiltering-fields'
				))
			);
			$div->appendChild(
				Widget::Select('comparison', array(
					array('contains', false, __('contains')),
					array('is', false, __('is'))
				), array(
					'class' => 'publishfiltering-comparison'
				))
			);
			$form->appendChild($div);
			$form->appendChild(
				Widget::Input('value', null, 'text', array(
					'class' => 'publishfiltering-search',
					'placeholder' => __('Type to search') . ' …')
				)
			);

			return $form;
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