<!-- Custom CTA Choice -->
<?php if(get_field('cta_option') == 'custom') :?>
	<div class="cta cta--custom">
		<div class="cta__content-wrapper">
			<h2 class="cta__hed"><?php the_field('custom_cta_header'); ?></h2>
			<p class="cta__dek"><?php the_field('custom_cta_subtext'); ?></p>
			<?php
				$link = get_field('custom_cta_button_link');
				if( $link ):
					$link_url = $link['url'];
					$link_target = $link['target'] ? $link['target'] : '_self';
					?>
					<a href="<?php echo esc_url($link_url); ?>" target="<?php echo esc_attr($link_target); ?>" class="cta__button"><?php the_field('custom_cta_button_text'); ?></a>
			<?php endif; ?>
		</div>
		<div class="cta__image-wrapper">
			<?php
			$imgID = get_field('custom_cta_image');
			if ($imgID && wp_attachment_is_image($imgID)) {
				$desk2x = wp_get_attachment_image_src($imgID, 'large-img-@2x');
				$alt = get_post($imgID)->post_title; ?>
				<picture class="cta__image">
					<img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
					<noscript><img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>"></noscript>
				</picture>
			<?php } ?>
		</div>
	</div>
<?php endif; ?>

<!-- No CTA Choice -->
<?php if(get_field('cta_option') == 'none') :?>
<?php endif; ?>