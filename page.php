<?php
/**
 * @package WordPress
 * @subpackage Sample Custom Theme
 */

get_header();

if (have_posts()) : while (have_posts()) : the_post(); ?>

	<article <?php post_class('entry') ?> id="content" role="main">

		<header class="marquee marquee--interior">
			<div class="marquee__image-wrapper">
				<?php get_template_part('includes/featured_image_marq'); ?>
			</div>
			<h1 class="marquee__hed"><span class="marquee__hed-wrapper"><?php the_title(); ?></span></h1>
		</header>

		<div class="entry__body">
			<?php the_content(); ?>
		</div>

	</article>

<?php get_template_part('includes/cta');

endwhile; endif;

get_footer();