<div class="feature__image-wrapper">
	<?php
	$imgID = get_field('image');
	if ($imgID && wp_attachment_is_image($imgID)) {
		$desk = wp_get_attachment_image_src($imgID, 'large-img');
		$desk2x = wp_get_attachment_image_src($imgID, 'large-img-@2x');
		$tab = wp_get_attachment_image_src($imgID, 'medium-img');
		$tab2x = wp_get_attachment_image_src($imgID, 'medium-img-@2x');
		$hand = wp_get_attachment_image_src($imgID, 'small-img');
		$hand2x = wp_get_attachment_image_src($imgID, 'small-img-@2x');
		$alt = get_post($imgID)->post_title; ?>
		<picture class="feature__image">
			<source data-srcset="<?php echo $desk[0]; ?> 1x, <?php echo $desk2x[0]; ?> 2x" media="(min-width: 900px)">
			<source data-srcset="<?php echo $tab[0]; ?> 1x, <?php echo $tab2x[0]; ?> 2x" media="(min-width: 600px)">
			<source data-srcset="<?php echo $hand[0]; ?> 1x, <?php echo $hand2x[0]; ?> 2x" media="(min-width: 0px)">
			<img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
			<noscript><img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>"></noscript>
		</picture>
	<?php }?>
</div>