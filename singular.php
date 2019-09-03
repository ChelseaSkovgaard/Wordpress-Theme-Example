<?php
/**
 * @package WordPress
 * @subpackage Sample Custom Theme
 */

get_header();

if (have_posts()) : while (have_posts()) : the_post(); ?>

	<section <?php post_class('entry') ?> id="content" role="main">

		<header class="marquee-single">
			<h1 class="marquee-single__hed"><?php the_title(); ?></h1>
			<div class="marquee-single__sub">
				<p>
					<?php
					$post_object = get_field('author');
					if( $post_object ){
						$post = $post_object;
						setup_postdata( $post ); 
						the_field('first_name'); echo " "; the_field('last_name');
					} else {
						the_field('guest_author');
					} wp_reset_postdata(); ?>
				</p>
				<p>
					<?php echo get_the_date( 'F j, Y' ); ?>
				</p>
			</div>
		</header>

		<?php get_template_part('includes/featured_image_med'); ?>

		<?php if (get_post(get_post_thumbnail_id())->post_excerpt) { ?>
    	<p class="marquee-single__caption">
				<?php echo wp_kses_post(get_post(get_post_thumbnail_id())->post_excerpt); ?>
			</p>
		<?php } ?>

		<section class="entry__container">
			<?php get_template_part('includes/social_share');?>
			<div class="entry__body">
				<?php the_content(); ?>
			</div>
		</section>

		<span class="social-share-stop-trigger"></span>

		<?php get_template_part('includes/author_box');?>
		
		<?php get_template_part('includes/news-cards'); ?>

	</section>

<?php endwhile; endif;

get_footer();