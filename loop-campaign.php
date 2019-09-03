<article class="card">
	<div class="card__image-wrapper">
		<?php
		$imgID = get_field('campaign_card_image');
		if ($imgID && wp_attachment_is_image($imgID)) {
			$tab2x = wp_get_attachment_image_src($imgID, 'medium-img-@2x');
			$alt = get_post($imgID)->post_title; ?>
			<picture class="card__image">
				<img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
				<noscript><img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>"></noscript>
			</picture>
		<?php }?>
	</div>
	<div class="card__content-wrapper">
		<h2 class="card__hed"><?php the_title(); ?></h2>
		<p class="card__dek"><?php the_field('campaign_excerpt'); ?></p>
		<a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>" class="button-link card__button">Learn More</a>
	</div>
</article>