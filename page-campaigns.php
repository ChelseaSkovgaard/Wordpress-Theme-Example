<?php
/**
 * Template Name: Campaigns Page
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

		<?php
		$post_object = get_field('featured_campaign');
		if( $post_object ):
		$post = $post_object;
		setup_postdata( $post );
		?>
			<section class="feature">
				<div class="feature__text-wrapper feature__text-wrapper--left">
					<h2 class="feature__hed"><?php the_title(); ?></h2>
					<p class="feature__dek"><?php the_field('campaign_body_text'); ?></p>
					<a href="<?php the_permalink(); ?>" class="button-link feature__button">Learn More</a>
				</div>
				<div class="feature__image-wrapper">
					<?php
					$imgID = get_field('campaign_header_image');
					if ($imgID && wp_attachment_is_image($imgID)) {
						$desk2x = wp_get_attachment_image_src($imgID, 'large-img-@2x');
						$alt = get_post($imgID)->post_title; ?>
						<picture class="feature__image">
							<img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
						</picture>
					<?php } ?>
				</div>
			</section>
		<?php wp_reset_postdata(); endif; ?>

		<?php get_template_part('includes/cards_campaign_archive'); ?>
		<?php get_template_part('includes/cta'); ?>

	</section>

<?php endwhile; endif;

get_footer();