<?php
	
	class Extension_PublishFiltering extends Extension {
	
	/*-------------------------------------------------------------------------
		Extension definition
	-------------------------------------------------------------------------*/
		
		private $_incompatible_publishpanel = array('mediathek', 'imagecropper', 'readonlyinput');
		
		public function getSubscribedDelegates() {
			return array(
				array(
					'page'		=> '/backend/',
					'delegate'	=> 'InitaliseAdminPageHead',
					'callback'	=> 'initaliseAdminPageHead'
				),
				array(
					'page'		=> '/blueprints/sections/',
					'delegate'	=> 'AddSectionElements',
					'callback'	=> 'addSectionSetting'
				),
				array(
					'page'		=> '/blueprints/sections/',
					'delegate'	=> 'SectionPreCreate',
					'callback'	=> 'saveSectionSettings'
				),
				array(
					'page'		=> '/blueprints/sections/',
					'delegate'	=> 'SectionPreEdit',
					'callback'	=> 'saveSectionSettings'
				)
			);
		}
		
	/*-------------------------------------------------------------------------
		Delegates
	-------------------------------------------------------------------------*/
	
		/**
		 * Add setting to the section editor head to enable publish filtering
		 * for this section. Defaults to 'yes'.
		 */		
		public function addSectionSetting($context) {
			/*
			// Get current setting
			$setting = array();
			if($context['meta']['filterable'] == 'no') {
				$setting = array('checked' => 'checked');
			}

			// Prepare setting
			$label = new XMLElement('label');
			$checkbox = new XMLElement('input', null, array_merge($setting, array('name' => 'meta[filterable]', 'type' => 'checkbox', 'value' => 'no')));
			$label->setValue(__('%s Disable publish filtering for this section', array(
				$checkbox->generate()
			)));
			
			// Find context
			$fieldset = $context['form']->getChildren();
			$group = $fieldset[0]->getChildren();
			$column = $group[1]->getChildren();
			
			// Append setting
			$column[0]->appendChild($label);
			*/
		}
		
		/**
		 * If a section should be filterable, make sure 'filterable' is set to 'yes'
		 */
		public function saveSectionSettings($context) {
			/*if(!$context['meta']['filterable']) {
				$context['meta']['filterable'] = 'yes';
			}*/
		}
		
		/**
		 * Add publish filter
		 */
		public function initaliseAdminPageHead($context) {
			$page = Administration::instance()->Page;
			$callback = Administration::instance()->getPageCallback();
			
			// Include filter?
			if ($page instanceOf contentPublish && $callback['context']['page'] == 'index') {
				
				$sm = new SectionManager(Symphony::Engine());
				$section_handle = $page->_context['section_handle'];
				$section_id = $sm->fetchIDFromHandle($section_handle);
				
				if(!$section_id) return;
				
				$section = $sm->fetch($section_id);
				$fields = array();
				
				// Section is filterable
				//if($section->get('filterable') == 'yes') {
					foreach ($section->fetchFilterableFields() as $field) {
						if (in_array($field->get('type'), $this->_incompatible_publishpanel)) continue;
	
						$fields[$field->get('label')]['handle'] = General::sanitize($field->get('element_name'));
	
						$html = new XMLElement('html');
						
						/*
							fields can choose to use getDefaultPublishContent to return a list values only,
							if their displayPublishPanel HTML is complex
							https://github.com/nickdunn/publishfiltering/issues/4
						*/
						if(method_exists($field, 'getDefaultPublishContent')) {
							$field->getDefaultPublishContent($html);
						} else {
							$field->displayPublishPanel($html);
						}
						
						// filter out some HTML nasties
						$html = preg_replace(
							'/&(?!(#[0-9]+|#x[0-9a-f]+|amp|lt|gt);)/i', '&amp;',
							$html->generate()
						);
						
						$dom = new DomDocument();
						
						libxml_use_internal_errors(true);
						$dom->loadXML($html);
						$xml_errors = libxml_get_errors();
						// XML is malformed, skip this field :-(
				        if (!empty($xml_errors)) continue;
	
						$xpath = new DomXPath($dom);
	
						$count = 0;
						foreach($xpath->query("//*[name()='option'] | //*[name()='li']") as $option) {
	
							$value = '';
	
							if ($option->getAttribute('value')) {
								$value = $option->getAttribute('value');
							} else {
								$value = $option->nodeValue;
							}
	
							if ($value != '') {
								$fields[$field->get('label')]['options'][$count]['label'] = $option->nodeValue;
								$fields[$field->get('label')]['options'][$count]['value'] = $value;
								$count++;
							}
	
						}
	
						if ($field->get('type') == 'checkbox') {
							$fields[$field->get('label')]['options'][] = 'Yes';
							$fields[$field->get('label')]['options'][] = 'No';
						}
	
					}
					
					$page->addElementToHead(new XMLElement(
						'script',
						"Symphony.Context.add('publishfiltering', " . json_encode($fields) . ")",
						array('type' => 'text/javascript')
					), 92370001);
					
					$page->addStylesheetToHead(URL . '/extensions/publishfiltering/assets/publishfiltering.publish.css', 'screen', 92370002);
					$page->addScriptToHead(URL . '/extensions/publishfiltering/assets/publishfiltering.publish.js', 92370003);
					
					$page->insertDrawer(Widget::Drawer('publish-filtering', __('Filter Entries'), NULL, 'closed', $section_handle), 'horizontal');
					
					
				//}
			}
			
		}
		
	/*-----------------------------------------------------------------------*/
		
		public function install() {
			//return Administration::instance()->Database()->query("ALTER TABLE `tbl_sections` ADD `filterable` enum('yes','no') NOT NULL DEFAULT 'yes'");
		}
		
		public function update($previousVersion) {
			if(version_compare($previousVersion, '1.6', '<')) {
				$this->install();
			}
		}

		public function uninstall() {
			//return Administration::instance()->Database()->query("ALTER TABLE `tbl_sections` DROP `filterable`");
		}
				
	}
	
?>