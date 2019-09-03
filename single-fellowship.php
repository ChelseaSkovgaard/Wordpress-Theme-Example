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

		<section class="feature feature--fellowship">
			<div class="feature__image-wrapper">
				<?php
				$imgID = get_field('fellowship_header_image');
				if ($imgID && wp_attachment_is_image($imgID)) {
					$desk2x = wp_get_attachment_image_src($imgID, 'large-img-@2x');
					$alt = get_post($imgID)->post_title; ?>
					<picture class="feature__image">
						<img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
					</picture>
				<?php } ?>
			</div>
			<div class="feature__text-wrapper feature__text-wrapper--right">
				<h2 class="feature__hed"><?php the_field('fellowship_header'); ?></h2>
				<p class="feature__dek"><?php the_field('fellowship_description'); ?></p>
				<?php 
				$link = get_field('fellowship_application_button_link');
				if( $link ): 
					$link_url = $link['url'];
					$link_target = $link['target'] ? $link['target'] : '_self';
					?>
					<a href="<?php echo esc_url($link_url); ?>" target="<?php echo esc_attr($link_target); ?>" class="button-link feature__button"><?php the_field('fellowship_application_button_text'); ?></a>
				<?php endif; ?>
				<?php get_template_part('includes/carousel_campaign_fellowship'); ?>
			</div>
		</section>

		<?php get_template_part('includes/grid_fellows'); ?>

	</section>

<?php get_template_part('includes/cta'); 

endwhile; endif;

get_footer();