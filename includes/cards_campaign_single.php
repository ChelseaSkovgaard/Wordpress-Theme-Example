<?php // Recent Campaign Posts
$args = array(
	'post_type' => 'campaign',
	'posts_per_page' => 3,
	'ignore_sticky_posts' => 1,
	'post__not_in' => array($post->ID)
);
$query = new WP_Query($args);
if ( $query->have_posts() ) : ?>
	<section class="card__section">
		<h2 class="card__header">More Campaigns</h2>
		<div class="card__grid">
			<?php while ( $query->have_posts() ) : $query->the_post();
				get_template_part('loop-campaign');
			endwhile; wp_reset_postdata(); ?>
		</div>
	</section>
<?php endif;