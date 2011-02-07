<?php
	
	class Extension_PublishFiltering extends Extension {
	/*-------------------------------------------------------------------------
		Extension definition
	-------------------------------------------------------------------------*/
		
		private $_incompatible_publishpanel = array('mediathek', 'imagecropper', 'readonlyinput');
		
		public function about() {
			return array(
				'name'			=> 'Publish Filtering',
				'version'		=> '1.5.0',
				'release-date'	=> '2011-02-07',
				'author'		=> array(
					'name'			=> 'Nick Dunn',
					'website'		=> 'http://airlock.com'
				),
				'description'	=> 'Add a filter box to publish index pages.'
			);
		}
		
		public function getSubscribedDelegates() {
			return array(
				array(
					'page'		=> '/backend/',
					'delegate'	=> 'InitaliseAdminPageHead',
					'callback'	=> 'initaliseAdminPageHead'
				)
			);
		}
		
	/*-------------------------------------------------------------------------
		Delegates:
	-------------------------------------------------------------------------*/
		
		public function initaliseAdminPageHead($context) {
			$page = $context['parent']->Page;
			
			// Include filter?
			if ($page instanceof ContentPublish and $page->_context['page'] == 'index') {
				
				$sm = new SectionManager(Symphony::Engine());
				$section_id = $sm->fetchIDFromHandle($page->_context['section_handle']);
				$section = $sm->fetch($section_id);
				$fields = array();

				foreach ($section->fetchFilterableFields() as $field) {
					if (in_array($field->get('type'), $this->_incompatible_publishpanel)) continue;

					$fields[$field->get('label')]['handle'] = General::sanitize($field->get('element_name'));

					$html = new XMLElement('html');
					$field->displayPublishPanel($html);

					$dom = new DomDocument();
					$dom->loadXML($html->generate());

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
			}
			
		}
	}
	
?>