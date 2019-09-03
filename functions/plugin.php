<?php // WP Plugin hooks and php settings

// Enable ACF Options page
if( function_exists('acf_add_options_page') ) {
  acf_add_options_page();
}
