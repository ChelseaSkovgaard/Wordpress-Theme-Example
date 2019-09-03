<?php // Image defaults and functions (rwd shortcode in functions/shortcodes.php

add_action('after_setup_theme', 'rm_image_setup');
function rm_image_setup() {
	// Remove width & height from Mark-Up
	function rm_remove_image_dim_attr($html) {
		$html=preg_replace('/width=(["\'])(.*?)\1/', '', $html);
		$html=preg_replace('/height=(["\'])(.*?)\1/', '', $html);
		return $html;
	}

  // Additional Image Sizes for picture element
	add_image_size('large-img-@2x', 2400, 1960);
  add_image_size('medium-img-@2x', 1600, 1280);
  add_image_size('small-img-@2x', 1280, 960);
	add_image_size('large-img', 1200, 980);
  add_image_size('medium-img', 800, 640);
  add_image_size('small-img', 640, 480);

	// Get thumbnail size and create thumbnail 2x
  $thumb_w = get_option('thumbnail_size_w');
	$thumb_h = get_option('thumbnail_size_h');
	$thumb_crop = get_option('thumbnail_crop');

  add_image_size('thumbnail-img-@2x', ($thumb_w * 2), ($thumb_h * 2), ($thumb_crop ? true : false));

	add_filter('get_image_tag','rm_remove_image_dim_attr');
	add_filter('image_send_to_editor','rm_remove_image_dim_attr');
	add_filter('post_thumbnail_html','rm_remove_image_dim_attr');
}

add_filter( 'image_size_names_choose', 'rm_custom_sizes' );
function rm_custom_sizes( $sizes ) {
  return array(
	  'thumbnail'  => __( 'Thumbnail', 'revmsg-admin' ),
	  'small-img'  => __( 'Small', 'revmsg-admin' ),
		'medium-img' => __( 'Medium', 'revmsg-admin' ),
		'large-img'  => __( 'Large', 'revmsg-admin' ),
		'full'       => __( 'Full Size', 'revmsg-admin' )
  );
}

// Add rwd shortcode in editor
add_filter('image_send_to_editor', 'rm_rwdpic_responsive_insert_image', 10, 8);
function rm_rwdpic_responsive_insert_image($html, $id, $caption, $title, $align, $url, $size, $alt) {

	$caption = esc_attr($caption);
	$alt = esc_attr($alt);

  return "[rwd imageid='$id' align='$align' size='$size' link='$url' caption='$caption' alt='$alt']";

}

// Get ID from Image src
function rm_get_attachment_id_from_src($url) {
  global $wpdb;

  $prefix = $wpdb->prefix;
  $attachment = $wpdb->get_col($wpdb->prepare("SELECT ID FROM ".$prefix."posts"." WHERE guid='%s';", $url));

  return $attachment[0];
}