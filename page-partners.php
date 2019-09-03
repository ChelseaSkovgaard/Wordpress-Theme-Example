<?php
/**
 * Template Name: Partners Page
 * @package WordPress
 * @subpackage Sample Custom Theme
 */

get_header();

if (have_posts()) : while (have_posts()) : the_post(); ?>

	<header class="marquee marquee--interior">
		<div class="marquee__image-wrapper">
			<?php get_template_part('includes/featured_image_marq'); ?>				
		</div>		
		<h1 class="marquee__hed"><span class="marquee__hed-wrapper"><?php the_title(); ?></span></h1>
	</header>

	<div class="feature feature--partners">
		<div class="feature__text-wrapper feature__text-wrapper--left">
			<h2 class="feature__hed"><?php the_field('header'); ?></h2>
			<p class="feature__dek"><?php the_field('description'); ?></p>
		</div>
		<?php get_template_part('includes/acf_image_featured'); ?>
	</div>	

	<?php // Partners Logos
		$args = array(
			'post_type' => 'partner',
			'posts_per_page' => -1,
			'orderby' => 'title',
			'order' => 'ASC'
		);
		$query = new WP_Query($args);

		if ( $query->have_posts() ) : ?>

			<section class="grid-partners__section">			
				<div class="grid-partners__grid">
					<?php while ( $query->have_posts() ) : $query->the_post(); ?>
						<a href="<?php the_field('partner_organization_link'); ?>" target="_blank" class="grid-partners__link">
							<div class="grid-partners__image-wrapper">
								<?php get_template_part('includes/featured_image'); ?>
							</div>
						</a>
					<?php endwhile; wp_reset_postdata(); ?>
				</div>
			</section>

		<?php endif; ?>
	
	<?php get_template_part('includes/cta'); ?>

<?php endwhile; endif;

get_footer();