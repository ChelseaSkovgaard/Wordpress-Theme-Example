<?php // Must be inside a loop. - get_template_part('includes/featured_image');
if ( has_post_thumbnail() ) {
  $desk2x = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large-img-@2x');
  $alt = get_post(get_post_thumbnail_id())->post_title; ?>
	<picture class="marquee__image">
	  <img src="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
	</picture>
<?php }