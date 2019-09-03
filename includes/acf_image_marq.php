<?php
$imgID = get_field('marquee_background_image');
if ($imgID && wp_attachment_is_image($imgID)) {
  $desk2x = wp_get_attachment_image_src($imgID, 'large-img-@2x');
  $alt = get_post($imgID)->post_title; ?>
	<picture class="marquee__image">
		<img src="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
  </picture>
<?php }