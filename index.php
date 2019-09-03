<?php
/**
 * @package WordPress
 * @subpackage Sample Custom Site
 */

get_header();

?>

<section id="content" role="main">

	<header class="marquee marquee--interior">
		<div class="marquee__image-wrapper">
			<?php
			if ( has_post_thumbnail() ) {
				$desk2x = wp_get_attachment_image_src(get_post_thumbnail_id(get_option('page_for_posts'),'full'), 'large-img-@2x');
				$alt = get_post(get_post_thumbnail_id(get_option('page_for_posts'),'full'))->post_title; ?>
				<picture class="marquee__image">
					<img src="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
				</picture>
			<?php } ?>
		</div>
		<h1 class="marquee__hed marquee__hed--desktop"><span class="marquee__hed-wrapper"><?php echo get_the_title(get_option('page_for_posts')); ?></span></h1>
	</header>

	<?php get_template_part('searchform-blog'); ?>

	<?php if (have_posts()) : ?>
		<section class="posts-container">
			<?php while (have_posts()) : the_post();
				get_template_part('loop');
			endwhile; ?>
		</section>
		<?php if ( $wp_query->max_num_pages > 1 ) {
			echo '<a href="#" class="load-more load-more--blog button-link">Load More</a>';
		}
	endif; ?>
	
</section>

<?php get_footer();