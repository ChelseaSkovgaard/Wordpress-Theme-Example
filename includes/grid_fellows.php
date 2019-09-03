<div class="grid-people__section">
	<h1 class="grid-people__header">Fellows Involved</h1>
	<?php $fellows = get_field('fellowship_fellows');
	if( $fellows ): ?>
		<section class="grid-people__grid">
			<?php foreach( $fellows as $fellow ): ?>
			<a href="<?php the_permalink($fellow->ID) ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>" class="grid-people__item">
				<div class="grid-people__image-wrapper">
					<?php 
					if ( has_post_thumbnail($fellow->ID) ) {
						$tab = wp_get_attachment_image_src(get_post_thumbnail_id($fellow->ID), 'medium-img');
						$tab2x = wp_get_attachment_image_src(get_post_thumbnail_id($fellow->ID), 'medium-img-@2x');
						$hand = wp_get_attachment_image_src(get_post_thumbnail_id($fellow->ID), 'small-img');
						$hand2x = wp_get_attachment_image_src(get_post_thumbnail_id($fellow->ID), 'small-img-@2x');
						$alt = get_post(get_post_thumbnail_id($fellow->ID))->post_title; ?>
						<picture class="grid-people__image">
							<!--[if IE 9]><video style="display: none;"><![endif]-->
							<source data-srcset="<?php echo $tab[0]; ?> 1x, <?php echo $tab2x[0]; ?> 2x" media="(min-width: 600px)">
							<source data-srcset="<?php echo $hand[0]; ?> 1x, <?php echo $hand2x[0]; ?> 2x" media="(min-width: 0px)">
							<!--[if IE 9]></video><![endif]-->
							<img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
							<noscript><img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>"></noscript>
						</picture>
					<?php } ?>
				</div>
				<div class="grid-people__content-wrapper">
					<h2 class="grid-people__hed"><?php the_field('first_name', $fellow->ID); ?> <?php the_field('last_name', $fellow->ID); ?></h2>
					<p class="grid-people__sub"><?php the_field('region', $fellow->ID); ?></p>
				</div>
			</a>
			<?php endforeach; ?>
		</section>
	<?php endif; ?>
</div>