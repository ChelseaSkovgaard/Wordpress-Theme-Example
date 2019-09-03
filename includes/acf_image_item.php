<div class="item__image-wrapper">
	<?php
	$img = get_sub_field('image');
	if ($img && wp_attachment_is_image($img)) {
		$desk = wp_get_attachment_image_src($img, 'large-img');
		$desk2x = wp_get_attachment_image_src($img, 'large-img-@2x');
		$tab = wp_get_attachment_image_src($img, 'medium-img');
		$tab2x = wp_get_attachment_image_src($img, 'medium-img-@2x');
		$hand = wp_get_attachment_image_src($img, 'small-img');
		$hand2x = wp_get_attachment_image_src($img, 'small-img-@2x');
		$alt = get_post($img)->post_title; ?>
		<picture class="item__image">
			<!--[if IE 9]><video style="display: none;"><![endif]-->
			<source data-srcset="<?php echo $desk[0]; ?> 1x, <?php echo $desk2x[0]; ?> 2x" media="(min-width: 900px)">
			<source data-srcset="<?php echo $tab[0]; ?> 1x, <?php echo $tab2x[0]; ?> 2x" media="(min-width: 600px)">
			<source data-srcset="<?php echo $hand[0]; ?> 1x, <?php echo $hand2x[0]; ?> 2x" media="(min-width: 0px)">
			<!--[if IE 9]></video><![endif]-->
			<img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
			<noscript><img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>"></noscript>
		</picture>
	<?php } ?>
</div>
