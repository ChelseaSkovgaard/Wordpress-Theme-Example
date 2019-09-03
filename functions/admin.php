<?php // WP Admin Functions

// No Comments
add_action( 'admin_menu', 'rm_menu_page_removing' );
function rm_menu_page_removing() {
  remove_menu_page( 'edit-comments.php' );
}

/* Remove Shortlink */
remove_action( 'wp_head', 'wp_shortlink_wp_head');

/* Remove Generator from Head */
remove_action('wp_head', 'wp_generator');

add_action('after_setup_theme', 'rm_theme_setup');
function rm_theme_setup() {


	// Register Navigation Bars
	if(function_exists('register_nav_menu')) {
		add_theme_support('menus');
		register_nav_menu('primary', 'Primary Navigation');
		register_nav_menu('secondary', 'Secondary Navigation');
	}

	// wrap it in a <nav>
	add_filter('wp_nav_menu_args', 'rm_prefix_nav_menu_args');
	function rm_prefix_nav_menu_args($args = '') {
    $args['container'] = 'nav';
    return $args;
	}

	// Add Feature Support
	add_theme_support('post-thumbnails');
	add_theme_support('automatic-feed-links');


  // Customize the Excerpt
  // Remove Auto Paragraph for excerpt
  remove_filter('the_excerpt', 'wpautop');

  // Sets the post excerpt length to 40 words.
  add_filter('excerpt_length', 'rm_bp_excerpt_length');
  function rm_bp_excerpt_length($length) {
  	return 20;
  }

  // Returns a "Continue Reading" link for excerpts
  function rm_bp_continue_reading_link() {
  	return '';
  }

  // Replaces "[...]" (appended to automatically generated excerpts) with an ellipsis and rm_bp_continue_reading_link().
  add_filter('excerpt_more','rm_bp_auto_excerpt_more');
  function rm_bp_auto_excerpt_more($more) {
  	return ' &hellip;'.rm_bp_continue_reading_link();
  }

  // Adds a pretty "Continue Reading" link to custom post excerpts.
  add_filter('get_the_excerpt', 'rm_bp_custom_excerpt_more');
  function rm_bp_custom_excerpt_more($output) {
  	if(has_excerpt() && ! is_attachment()) {
  		$output .= rm_bp_continue_reading_link();
  	}
  	return $output;
  }
}

/* Remove Recent Comment inline style */
add_action( 'widgets_init', 'remove_wp_widget_recent_comments_style' );
function remove_wp_widget_recent_comments_style() {
  global $wp_widget_factory;
  remove_action( 'wp_head', array( $wp_widget_factory->widgets['WP_Widget_Recent_Comments'], 'recent_comments_style' ) );
}

// Remove all the category & comments RSS feed links
remove_action( 'wp_head','feed_links_extra', 3 );
add_filter( 'feed_links_show_comments_feed', '__return_false' );


// Get and Save Vimeo Thumbs
add_action( 'wp_insert_post', 'video_carousel_thumbs', 10, 2 );
function video_carousel_thumbs( $post_id ){

	if ( !have_rows('video_slider_video', $post_id)){
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ){
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ){
		return;
	}

	// Load Vimeo PHP Library //Client Ids and Tokens Removed
	require_once(locate_template('functions/vimeo.php/autoload.php'));
  $vimeo_client_id 		= 'XXXXX';
	$vimeo_client_secret 	= 'XXX';
	$vimeo_token 			= 'XXXX';

	// Connect
	$vimeoLib = new \Vimeo\Vimeo($vimeo_client_id, $vimeo_client_secret, $vimeo_token);
	$vimeoLib->setToken($vimeo_token);

	// Video Carousel
	while ( have_rows('video_slider_video', $post_id) ) : the_row();
		$vimeo_url = get_sub_field('link');
		if (!$vimeo_url || (get_sub_field('small_image') && get_sub_field('medium_image') && get_sub_field('large_image'))) {
			continue;
		}
		$url_parts = parse_url($vimeo_url);
		$id = str_replace('/', '', $url_parts['path']);
		// Response
		$response = $vimeoLib->request('/me/videos/'. $id);
		if(200 === $response['status']){

			update_sub_field( 'small_image', sanitize_text_field($response['body']['pictures']['sizes'][1]['link']) );
			update_sub_field( 'medium_image', sanitize_text_field($response['body']['pictures']['sizes'][3]['link']) );
			update_sub_field( 'large_image', sanitize_text_field($response['body']['pictures']['sizes'][5]['link']) );

		// Just in case we add public videos
		} else if (404 === $response['status']) {
		  $data = @file_get_contents("http://vimeo.com/api/v2/video/$id.json");
		  if (false === $data) {
			  return;
			}
		  $data = json_decode($data);
		  update_sub_field( 'small_image', sanitize_text_field($data[0]->thumbnail_medium) );
			update_sub_field( 'medium_image', sanitize_text_field($data[0]->thumbnail_large) );
			update_sub_field( 'large_image', sanitize_text_field($data[0]->thumbnail_large) );
		}
	endwhile;
}

