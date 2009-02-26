<?php

	require_once(TOOLKIT . '/class.administrationpage.php');
	
	class ContentExtensionPublishfilteringFilters extends AdministrationPage {
		protected $_driver = null;
		
		public function __construct(&$parent){
			parent::__construct($parent);
			
			$this->_driver = $this->_Parent->ExtensionManager->create('publishfiltering');
		}
		
		public function __viewIndex() {
			header('content-type: text/javascript');
			
			$sm = new SectionManager($this->_Parent);
			$section_id = $sm->fetchIDFromHandle($_GET['section']);
			$section = $sm->fetch($section_id);
			$fields = array();
			
			foreach ($section->fetchFilterableFields() as $field) {
				$fields[$field->get('label')] = $field->get('element_name');
			}
			
			echo 'var filters = ', json_encode($fields), ";\n";
			echo 'var filters_label = "', __('Filter With Selected...'), "\";\n";
			echo 'var filters_button = "', __('Go'), "\";\n";
			exit;
		}
	}
	
?>