<?php // Theme Functions

/**
 * Custom Pagination
 * - call sc_custom_pagination($query->max_num_pages, '', $paged);
 */
function sc_custom_pagination($numpages = '', $pagerange = '', $paged='') {
	if (empty($pagerange)) {
		$pagerange = 2;
	}
	global $paged;
	if (empty($paged)) {
		$paged = 1;
	}
	if ($numpages == '') {
		global $wp_query;
		$numpages = $wp_query->max_num_pages;
		if(!$numpages) {
				$numpages = 1;
		}
	}
	$pagination_args = array(
		'base'		  => get_pagenum_link(1) . '%_%',
		'format'		=> 'page/%#%/',
		'total'			=> $numpages,
		'current'		=> $paged,
		'mid_size'	=> $pagerange,
		'prev_next'	=> false,
		'type'			=> 'list'
	);
	$paginate_links = paginate_links($pagination_args);
	if ($paginate_links) {
		echo '<nav class="pagination">' . $paginate_links . '</nav>';
	}
}

// Next Post link classes!
add_filter('next_post_link', 'next_post_link_attributes');
function next_post_link_attributes($output) {
	$injection = 'class="pagination__link pagination__link--next"';
	return str_replace('<a href=', '<a '.$injection.' href=', $output);
}
// Prev Post link classes!
add_filter('previous_post_link', 'prev_post_link_attributes');
function prev_post_link_attributes($output) {
	$injection = 'class="pagination__link pagination__link--prev"';
	return str_replace('<a href=', '<a '.$injection.' href=', $output);
}

// Get our wp_nav_menu() fallback, wp_page_menu(), to show a home link.
add_filter( 'wp_page_menu_args', 'rm_bp_page_menu_args' );
function rm_bp_page_menu_args($args) {
	$args['show_home'] = true;
	return $args;
}


// Header CSS for Background Images using rm_responsive_bgd_img
add_action( 'wp_head', 'rm_header_css');
function rm_header_css(){

	// Pages Marq
	if (is_page() && has_post_thumbnail()) {
		$styles .= rm_responsive_bgd_img(get_post_thumbnail_id(), '.marquee__image-container');
	}

	// Echo Styles
	echo ($styles) ? "<style>" . $styles . "\n</style>\n" : '';
}

// Responsive Background Image Function
function rm_responsive_bgd_img($imageID, $selector){
	// Sizes
	$imgHand2x = wp_get_attachment_image_src($imageID, 'small-img-@2x')[0];
	$imgTab2x = wp_get_attachment_image_src($imageID, 'medium-img-@2x')[0];
	$imgDesk2x = wp_get_attachment_image_src($imageID, 'large-img-@2x')[0];
	$imgFull = wp_get_attachment_image_src($imageID, 'full')[0];

	if (!$imgHand2x || !$selector)
		return;

	// Mobile
	$styles = "
$selector {
	background-image: url($imgHand2x);
}";
	// Phablet if bigger img exists
	if ($imgHand2x !== $imgTab2x) {
		$styles .= "
		@media screen and (min-width: 600px) {
			$selector {
				background-image: url($imgTab2x);
			}
		}";
		// Tablet if bigger img exists
		if ($imgTab2x !== $imgDesk2x) {
			$styles .= "
			@media screen and (min-width: 768px) {
				$selector {
					background-image: url($imgDesk2x);
				}
			}";
			// Notebook if bigger img exists
			if ($imgDesk2x !== $imgFull) {
				$styles .= "
				@media screen and (min-width: 980px) {
					$selector {
						background-image: url($imgFull);
					}
				}";
			}
		}
	}
	return $styles;
}