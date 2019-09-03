<?php
/**
 * @package WordPress
 * @subpackage Sample Custom Theme
 */

get_header();

if (have_posts()) : while (have_posts()) : the_post(); ?>
	<section id="content" role="main">

		<header class="marquee marquee--interior">
			<div class="marquee__image-wrapper">
				<?php get_template_part('includes/featured_image_marq'); ?>
			</div>
			<h1 class="marquee__hed"><span class="marquee__hed-wrapper"><?php the_title(); ?></span></h1>
		</header>

		<section class="feature">
			<div class="feature__image-wrapper">
				<?php
				$imgID = get_field('campaign_header_image');
				if ($imgID && wp_attachment_is_image($imgID)) {
					$desk2x = wp_get_attachment_image_src($imgID, 'large-img-@2x');
					$alt = get_post($imgID)->post_title; ?>
					<picture class="feature__image">
						<img data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
					</picture>
				<?php } ?>
			</div>
			<div class="feature__text-wrapper feature__text-wrapper--right">
				<h2 class="feature__hed"><?php the_field('campaign_header'); ?></h2>
				<p class="feature__dek"><?php the_field('campaign_body_text'); ?></p>
				<?php get_template_part('includes/carousel_partners'); ?>
			</div>
		</section>

		<section class="grid-people__section">
			<h1 class="grid-people__header">Fellows Involved</h1>
			<?php $fellows = get_field('campaign_fellows');
			if( $fellows ): ?>
				<section class="grid-people__grid">
					<?php foreach( $fellows as $fellow ): ?>
						<a href="<?php the_permalink($fellow->ID) ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>" class="grid-people__item">
							<div class="grid-people__image-wrapper">
								<?php
								if ( has_post_thumbnail($fellow->ID) ) {
									$tab2x = wp_get_attachment_image_src(get_post_thumbnail_id($fellow->ID), 'medium-img-@2x');
									$alt = get_post(get_post_thumbnail_id($fellow->ID))->post_title; ?>
									<picture class="feature__image">
										<img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
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
		</section>

		<?php get_template_part('includes/cards_campaign_single'); ?>

	</section>


<?php get_template_part('includes/cta');

endwhile; endif;

get_footer();