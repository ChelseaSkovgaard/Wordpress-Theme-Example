<?php
/**
 * @package WordPress
 * @subpackage Sample Custom Theme
 */

get_header();

if (have_posts()) : while (have_posts()) : the_post(); ?>

	<section id="content" role="main">

		<header class="marquee marquee--frontpage">
			<div class="marquee__image-wrapper">
				<?php get_template_part('includes/acf_image_marq'); ?>
			</div>
			<h1 class="marquee__hed"><span class="marquee__hed-wrapper"><?php the_field('marquee_header'); ?></span></h1>
		</header>

		<?php require_once(locate_template('includes/carousel_videos.php')); ?>

		<div class="home-section home-section--dark">

			<h1 class="home-section__hed"><?php the_field('fellowship_section_header'); ?></h1>
			<p class="home-section__dek home-section__dek--fellow"><?php the_field('fellowship_section_subtext'); ?></p>

			<?php get_template_part('includes/carousel_fellows'); ?>

			<a href="<?php the_field('fellowship_section_button_link'); ?>" class="button-link button-link--white home-section__button"><?php the_field('fellowship_section_button_text'); ?></a>

		</div>

		<div class="home-section home-section--light">
			<h1 class="home-section__hed"><?php the_field('news_section_header'); ?></h1>
			<p class="home-section__dek"><?php the_field('news_section_subtext'); ?></p>
			<div class="post-grid__section">
				<?php get_template_part('includes/grid_highlight'); ?>
				<?php get_template_part('includes/grid_sub'); ?>
			</div>
			<a href="<?php the_field('news_section_button_link'); ?>" class="button-link home-section__button"><?php the_field('news_section_button_text'); ?></a>

		</div>

		<span id="join-us"></span>
		<?php get_template_part('includes/cta'); ?>
		
	</section>

<?php endwhile; endif;

get_footer();