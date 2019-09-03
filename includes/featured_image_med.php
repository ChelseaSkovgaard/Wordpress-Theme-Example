<?php // Must be inside a loop. - include('includes/featured_image_med.php');
if ( has_post_thumbnail() ) {
  $tab = wp_get_attachment_image_src(get_post_thumbnail_id(), 'medium-img');
  $tab2x = wp_get_attachment_image_src(get_post_thumbnail_id(), 'medium-img-@2x');
  $hand = wp_get_attachment_image_src(get_post_thumbnail_id(), 'small-img');
  $hand2x = wp_get_attachment_image_src(get_post_thumbnail_id(), 'small-img-@2x');
  $alt = get_post(get_post_thumbnail_id())->post_title; ?>
	<picture class="featured-image__image">
	  <!--[if IE 9]><video style="display: none;"><![endif]-->
	  <source data-srcset="<?php echo $tab[0]; ?> 1x, <?php echo $tab2x[0]; ?> 2x" media="(min-width: 600px)">
	  <source data-srcset="<?php echo $hand[0]; ?> 1x, <?php echo $hand2x[0]; ?> 2x" media="(min-width: 0px)">
	  <!--[if IE 9]></video><![endif]-->
	  <img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
	  <noscript><img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>"></noscript>
	</picture>
<?php }