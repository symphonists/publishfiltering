<?php

	require_once(TOOLKIT . '/class.administrationpage.php');
	require_once(TOOLKIT . '/class.sectionmanager.php');
	require_once(TOOLKIT . '/class.fieldmanager.php');
	require_once(TOOLKIT . '/class.entrymanager.php');
	
	class ContentExtensionPublishfilteringFilters extends AdministrationPage {
		protected $_driver = null;
		protected $_incompatible_publishpanel = null;
		
		public function __construct(&$parent){
			parent::__construct($parent);
			
			$this->_driver = $this->_Parent->ExtensionManager->create('publishfiltering');
			$this->_incompatible_publishpanel = array('mediathek', 'imagecropper', 'readonlyinput');
		}
		
		public function __viewIndex() {
			
			$sm = new SectionManager(Symphony::Engine());
			$section_id = $sm->fetchIDFromHandle($_GET['section']);
			$section = $sm->fetch($section_id);
			$fields = array();
			
			foreach ($section->fetchFilterableFields() as $field) {
				if (in_array($field->get('type'), $this->_incompatible_publishpanel)) continue;

				$fields[$field->get('label')]['handle'] = $field->get('element_name');
				
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
			
			header('content-type: text/javascript');
			echo 'var filters = ', json_encode($fields), ";\n";
			exit;
		}
	}
	
?>