<?php
/**
 * Template Name: Search Page
 * @package WordPress
 * @subpackage Sample Custom Theme
 */

get_header(); ?>

<section id="content" role="main">

	<?php if (have_posts()) : ?>

		<div class="marquee-single marquee-single--search">
			<h1 class="marquee-single__hed">
			Search Results: <?php the_search_query();?>
			</h1>
			<form role="search" method="get" class="search-form-interior__form" id="search-form-interior" action="<?php echo esc_url( home_url( '/' ) ); ?>">
				<label class="assistive-text" for="s"><?php _e( 'Search for:', 			'presentation' ); ?></label>
				<input class="search-form-interior__input" type="search" name="s" placeholder="Search" id="search-input-interior" value="<?php echo get_search_query(); ?>" />
				<input class="search-form-interior__submit" type="submit" id="search-submit-interior" value="Search" />
			</form>
		</div>

		<div class="search-item__container">
			<?php while ( have_posts() ) : the_post(); get_template_part('loop', 'search');
			endwhile; ?>
		</div>

		<?php
		if ( $wp_query->max_num_pages > 1 ) {
			echo '<a href="#" class="load-more load-more--search button-link">Load More</a>';
		} ?>

	<?php else : ?>

		<div class="marquee-single marquee-single--search">
			<h1 class="marquee-single__hed">
			Search Results: <?php the_search_query();?>
			</h1>
			<form role="search" method="get" class="search-form-interior__form" id="search-form-interior" action="<?php echo esc_url( home_url( '/' ) ); ?>">
				<label class="assistive-text" for="s"><?php _e( 'Search for:', 			'presentation' ); ?></label>
				<input class="search-form-interior__input" type="search" name="s" placeholder="Search" id="search-input-interior" value="<?php echo get_search_query(); ?>" />
				<input class="search-form-interior__submit" type="submit" id="search-submit-interior" value="Search" />
			</form>
		</div>

		<div class="search-item__no-posts">
			No Results Found
		</div>

	<?php endif; ?>

</section>

<?php 

get_footer();
