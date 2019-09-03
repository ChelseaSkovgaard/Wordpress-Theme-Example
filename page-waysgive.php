<?php
/**
 * Template Name: Ways to Give Page
 * @package WordPress
 * @subpackage Sample Custom Theme
 */

get_header();

if (have_posts()) : while (have_posts()) : the_post(); ?>

	<section id="content" role="main">

		<header class="marquee marquee--interior marquee--give">
			<div class="marquee__image-wrapper">
				<?php get_template_part('includes/featured_image_marq'); ?>
			</div>
			<div class="marquee__content">
				<h1 class="marquee__hed marquee__hed--give"><span class="marquee__hed-wrapper"><?php the_field('marquee_header'); ?></span></h1>
				<h3 class="marquee__sub"><?php the_field('marquee_subtext'); ?></h3>
			</div>
		</header>

		<?php if( have_rows('ways_to_give_cards') ): ?>
			<section class="card__section">
				<div class="card__grid">
					<?php while ( have_rows('ways_to_give_cards') ) : the_row(); ?>
					<div class="card">
						<div class="card__image-wrapper">
							<?php
							$imgID = get_sub_field('image');
							if ($imgID && wp_attachment_is_image($imgID)) {
								$tab2x = wp_get_attachment_image_src($imgID, 'medium-img-@2x');
								$alt = get_post($imgID)->post_title; ?>
								<picture class="item__image">
									<img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">							
								</picture>
							<?php } ?>
						</div>
						<div class="card__content-wrapper">
							<h2 class="card__hed"><?php the_sub_field('header'); ?></h2>
							<p class="card__dek"><?php the_sub_field('description'); ?></p>
							<?php // Pop Up
							if ('popup' === get_sub_field('type_of_button')) {
								$modal_count = 0; ?>
								<div class="text-modal" id="modal_<?php echo $modal_count; ?>">
									<div class="text-modal__inner">
										<h3 class="text-modal__hed"><?php the_sub_field('header'); ?></h3>
										<p><?php the_sub_field('popup_text'); ?></p>
										<a href="#" class="text-modal__close"><svg class="text-modal__close-icon"><use xlink:href="#close"></use></svg></a>
									</div>
								</div>
								<a href="#modal_<?php echo $modal_count; ?>" class="button-link card__button"><?php the_sub_field('button_text'); ?></a>
								<?php $modal_count++;
							 // PDF Link
							} else if ('pdf' === get_sub_field('type_of_button')) { ?>
								<a href="<?php the_sub_field('pdf_file'); ?>" class="button-link card__button" target="_blank" download="<?php the_sub_field('header'); ?>"><?php the_sub_field('button_text'); ?></a>
							<?php // Regular Link
							} else { ?>
								<a href="<?php the_sub_field('button_link'); ?>" class="button-link card__button" target="_blank"><?php the_sub_field('button_text'); ?></a>
							<?php } ?>
						</div>
					</div>
				<?php endwhile; ?>
			</div>
		</section>
	<?php endif; ?>

	</section>

<?php endwhile; endif;

get_footer();