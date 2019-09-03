<?php
/**
 * @package WordPress
 * @subpackage Sample Custom Theme
 */

get_header(); ?>

<section id="content" role="main">

	<header class="not-found__marquee">
		<h1 class="not-found__hed"><?php the_field('page_not_found_heading', 'option'); ?></h1>
	</header>

	<section class="entry__body">
		<p><?php _e('Sorry, but the page you were trying to view does not exist.', 'SampleCustom'); ?></h1></p>
	</section>


</section>

<?php get_footer();