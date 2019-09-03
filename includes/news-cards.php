<?php // Recent Posts
$args = array(
	'post_type' => 'post',
	'posts_per_page' => 3,
	'ignore_sticky_posts' => 1,
	'post__not_in' => array($post->ID)
);
$query = new WP_Query($args);
if ( $query->have_posts() ) : ?>
	<section class="card__section">
		<h2 class="card__header">More Blog Posts</h2>
		<div class="card__grid">
			<?php while ( $query->have_posts() ) : $query->the_post();
				get_template_part('loop-card');
			endwhile; wp_reset_postdata(); ?>
		</div>
		<a href="/blog" class="button-link card__button-view">View More</a>
	</section>
<?php endif;
