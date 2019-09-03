<?php
/**
 * Template Name: About Page
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

	<div class="feature" >
		<div class="feature__text-wrapper  feature__text-wrapper--left">
			<h2 class="feature__hed"><?php the_field('section_one_header'); ?></h2>
			<p class="feature__dek"><?php the_field('section_one_description'); ?></p>
			<?php 
			$link = get_field('section_one_button_link');
			if( $link ): 
				$link_url = $link['url'];
				$link_target = $link['target'] ? $link['target'] : '_self';
				?>
				<a href="<?php echo esc_url($link_url); ?>" target="<?php echo esc_attr($link_target); ?>" class="button-link feature__button"><?php the_field('section_one_button_text'); ?></a>
			<?php endif; ?>
		</div>
		<div class="feature__image-wrapper">
			<?php
			$imgID = get_field('section_one_image');
			if ($imgID && wp_attachment_is_image($imgID)) {
				$desk2x = wp_get_attachment_image_src($imgID, 'large-img-@2x');
				$alt = get_post($imgID)->post_title; ?>
				<picture class="banner__image">
					<img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
				</picture>
			<?php } ?>
		</div>
	</div>

	<div class="banner">
		<div class="banner__text-wrapper">
			<h2 class="banner__hed"><?php the_field('section_two_header'); ?></h2>
			<p class="banner__dek"><?php the_field('section_two_description'); ?></p>
			<a href="<?php the_field('section_two_button_link'); ?>" class="button-link button-link--white banner__button"><?php the_field('section_two_button_text'); ?></a>
		</div>
		<div class="banner__image-wrapper">
		<?php
			$imgID = get_field('section_two_image');
			if ($imgID && wp_attachment_is_image($imgID)) {
				$desk2x = wp_get_attachment_image_src($imgID, 'large-img-@2x');
				$alt = get_post($imgID)->post_title; ?>
				<picture class="banner__image">
					<img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
				</picture>
			<?php } ?>
		</div>
	</div>

	<div class="home-section home-section--dark home-section--interior">
		<h1 class="home-section__hed"><?php the_field('section_three_header'); ?></h1>
		<p class="home-section__dek"><?php the_field('section_three_description'); ?></p>
		<?php require_once(locate_template('includes/carousel_videos.php')); ?>
	</div>

	<div class="banner">
		<div class="banner__text-wrapper">
			<h2 class="banner__hed"><?php the_field('section_four_header'); ?></h2>
			<p class="banner__dek"><?php the_field('section_four_description'); ?></p>
			<a href="<?php the_field('section_four_button_link'); ?>" class="button-link button-link--white banner__button"><?php the_field('section_four_button_text'); ?></a>
		</div>
		<div class="banner__image-wrapper">
		<?php
			$imgID = get_field('section_four_image');
			if ($imgID && wp_attachment_is_image($imgID)) {
				$desk2x = wp_get_attachment_image_src($imgID, 'large-img-@2x');
				$alt = get_post($imgID)->post_title; ?>
				<picture class="banner__image">
					<img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
				</picture>
			<?php } ?>
		</div>
	</div>

	<div class="feature">
		<div class="feature__text-wrapper feature__text-wrapper--left">
			<h2 class="feature__hed"><?php the_field('section_five_header'); ?></h2>
			<p class="feature__dek"><?php the_field('section_five_description'); ?></p>
			<a href="<?php the_field('section_five_button_link'); ?>" class="button-link feature__button"><?php the_field('section_five_button_text'); ?></a>
		</div>
		<div class="feature__image-wrapper">
			<?php
			$imgID = get_field('section_five_image');
			if ($imgID && wp_attachment_is_image($imgID)) {
				$desk2x = wp_get_attachment_image_src($imgID, 'large-img-@2x');
				$alt = get_post($imgID)->post_title; ?>
				<picture class="banner__image">
					<img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
				</picture>
			<?php } ?>
		</div>
	</div>

	<?php get_template_part('includes/cta'); ?>

</section>

<?php endwhile; endif;

get_footer();