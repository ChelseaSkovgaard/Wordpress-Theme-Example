<?php
/*
 * Manage Scripts and Styles
 * Custom script un/load
 */
add_action('wp_enqueue_scripts', 'rm_styles_scripts');
function rm_styles_scripts() {

	wp_enqueue_script('slick', get_stylesheet_directory_uri().'/js/slick.min.js', array('jquery'));

	// Local
	if(defined('PANTHEON_ENVIRONMENT') && 'lando' === PANTHEON_ENVIRONMENT) {
		// style.css
		wp_enqueue_style('style', get_stylesheet_directory_uri().'/style.css', array(), rm_versioned_resource('/css/style.min.css'));
		// jquery-form
		if (!wp_script_is( 'jquery-form', 'enqueued' )) {
			// Deregister wp core jquery-form, included manually
			wp_deregister_script('jquery-form');
			wp_enqueue_script('jquery-form', get_stylesheet_directory_uri().'/node_modules/jquery-form/src/jquery.form.js', array('jquery'), '', true);
		}
		// header - loads before the page!
		wp_enqueue_script('header', get_stylesheet_directory_uri().'/js/header.js', array('jquery'), rm_versioned_resource('/js/header.js'));
		// picturefill
		wp_enqueue_script('picturefill', get_stylesheet_directory_uri().'/node_modules/picturefill/dist/picturefill.min.js', array('jquery'), '', true);
		// lazysizes
		wp_enqueue_script('lazysizes', get_stylesheet_directory_uri().'/node_modules/lazysizes/lazysizes.js', array('jquery'), '', true);
		// plugins
		wp_enqueue_script('plugins', get_stylesheet_directory_uri().'/js/plugins.js', array('jquery'), rm_versioned_resource('/js/plugins.js'), true);
		// coffee
		wp_enqueue_script('coffee', get_stylesheet_directory_uri().'/js/coffee.js', array('jquery'), rm_versioned_resource('/js/coffee.js'), true);
		// ajax
		wp_enqueue_script('ajax', get_stylesheet_directory_uri().'/js/ajax.js', array('jquery'), rm_versioned_resource('/js/ajax.js'), true);
		// main
		wp_enqueue_script('main', get_stylesheet_directory_uri().'/js/main.js', array('jquery'), rm_versioned_resource('/js/main.js'), true);

		//loadmore
		global $wp_query;
		wp_localize_script( 'ajax', 'loadmore_params', array(
			'ajaxurl' => site_url() . '/wp-admin/admin-ajax.php', // WordPress AJAX
			'posts' => json_encode( $wp_query->query_vars ), // everything about your loop is here
			'current_page' => get_query_var( 'paged' ) ? get_query_var('paged') : 1,
			'max_page' => $wp_query->max_num_pages,
			'post_type' => $wp_query->post_type,
			'number_of_posts' => $wp_query->post_count
		));

	// Server
	} else {
		// css/style.min.css
		wp_enqueue_style('style', get_stylesheet_directory_uri().'/css/style.min.css', array(), rm_versioned_resource('/css/style.min.css'));
		// js/header.min.js
		wp_enqueue_script('header', get_stylesheet_directory_uri().'/js/header.min.js', array('jquery'), rm_versioned_resource('/js/header.min.js'));
		// js/main.min.js
		wp_enqueue_script('main', get_stylesheet_directory_uri().'/js/main.min.js', array('jquery'), rm_versioned_resource('/js/main.min.js'), true);

		//loadmore
		global $wp_query;
		wp_localize_script( 'main', 'loadmore_params', array(
			'ajaxurl' => site_url() . '/wp-admin/admin-ajax.php', // WordPress AJAX
			'posts' => json_encode( $wp_query->query_vars ), // everything about your loop is here
			'current_page' => get_query_var( 'paged' ) ? get_query_var('paged') : 1,
			'max_page' => $wp_query->max_num_pages,
			'post_type' => $wp_query->post_type,
			'number_of_posts' => $wp_query->post_count
		) );
	}
}

// filetime to set version on scripts/styles
if(!function_exists('rm_versioned_resource')) {
	function rm_versioned_resource($relative_url) {
		$file = dirname(__FILE__).$relative_url;
		$file_version = '';
		if(file_exists($file)) {
			$file_version = filemtime($file);
		}
		return $file_version;
	}
}

/**
 * Add async attributes to enqueued scripts where needed.
 *
 */
add_filter( 'script_loader_tag', 'rm_async_scripts', 10, 3 );
function rm_async_scripts( $tag, $handle, $src ) {
  // the handles of the enqueued scripts we want to async
  $async_scripts = array(
  	'main',
  	'ajax',
  	'jquery-form',
  	'picturefill',
  	'lazysizes',
  	'coffee'
  );
  if ( in_array( $handle, $async_scripts ) ) {
		return str_replace("></script>", " async='async'></script>", $tag);
  }
  return $tag;
}

//loadmore function
function revmsg_loadmore_ajax_handler(){
	$args = array();
	$number_of_posts = ($_POST['number_of_posts']) ? $_POST['number_of_posts'] : 10;
	$args['offset'] = $number_of_posts + (($_POST['page'] - 1) * 10);
	$args['posts_per_page'] = 10;
	$args['post_status'] = 'publish';
	$args['post_type'] = 'post';

	$query = new WP_Query($args);

	if( $query->have_posts() ) : while( $query->have_posts() ): $query->the_post();
		get_template_part('loop');
	endwhile; endif;
	die;
}

add_action('wp_ajax_loadmore', 'revmsg_loadmore_ajax_handler'); // wp_ajax_{action}
add_action('wp_ajax_nopriv_loadmore', 'revmsg_loadmore_ajax_handler'); // wp_ajax_nopriv_{action}

//blog search/filter function
function revmsg_filter_ajax_handler(){

	$args = array();
	$args['post_type'] = 'post';
	$args['posts_per_page'] = 10;
	$args['post_status'] = 'publish';

	// Search Filter
	if ('false' !== $_POST['search']){
		$args['s'] = $_POST['search'];
		$args['orderby'] = 'relevance';
	}

	$query = new WP_Query($args);
	if( $query->have_posts() ) : while( $query->have_posts() ): $query->the_post();
		get_template_part('loop');
	endwhile; endif;
}

add_action('wp_ajax_filter', 'revmsg_filter_ajax_handler'); // wp_ajax_{action}
add_action('wp_ajax_nopriv_filter', 'revmsg_filter_ajax_handler'); // wp_ajax_nopriv_{action}

//Loadmore for Search Results on Blog
function revmsg_loadmore_w_filter_ajax_handler(){
	// prepare our arguments for the query
	$args = array();
	$number_of_posts = ($_POST['number_of_posts']) ? $_POST['number_of_posts'] : 10;
	$args['offset'] = $number_of_posts + (($_POST['page'] - 1) * 10);
	$args['posts_per_page'] = 10;
	$args['post_status'] = 'publish';
	$args['post_type'] = 'post';

	// Search Filter
	if ('false' !== $_POST['search']){
		$args['s'] = $_POST['search'];
		$args['orderby'] = 'relevance';
	}

	$query = new WP_Query($args);
	if( $query->have_posts() ) : while( $query->have_posts() ): $query->the_post();
		get_template_part('loop');
	endwhile; endif;
	die;
}

add_action('wp_ajax_loadmore_w_filter', 'revmsg_loadmore_w_filter_ajax_handler'); // wp_ajax_{action}
add_action('wp_ajax_nopriv_loadmore_w_filter', 'revmsg_loadmore_w_filter_ajax_handler'); // wp_ajax_nopriv_{action}

//loadmore function
function revmsg_loadmore_search_ajax_handler(){
	$args = array();
	$number_of_posts = ($_POST['number_of_posts']) ? $_POST['number_of_posts'] : 10;
	$args['offset'] = $number_of_posts + (($_POST['page'] - 1) * 10);
	$args['posts_per_page'] = 10;
	$args['post_status'] = 'publish';

	// Search
	if ($_POST['search'][0]) {
		$args['s'] = $_POST['search'][0];
		}

	$query = new WP_Query($args);

	if( $query->have_posts() ) : while( $query->have_posts() ): $query->the_post();
		get_template_part('loop', 'search');
	endwhile; endif;
	die;
}

add_action('wp_ajax_loadmore_search', 'revmsg_loadmore_search_ajax_handler'); // wp_ajax_{action}
add_action('wp_ajax_nopriv_loadmore_search', 'revmsg_loadmore_search_ajax_handler');

// Includes
get_template_part('functions/admin');
get_template_part('functions/theme');
get_template_part('functions/images');
get_template_part('functions/walkers');
get_template_part('functions/plugin');
