<?php // Recent Posts
$args = array(
	'post_type' => 'post',
	'posts_per_page' => 3,
	'ignore_sticky_posts' => 1,
	'post__not_in' => array($post->ID)
);
$query = new WP_Query($args);
if ( $query->have_posts() ) : ?>
	<aside class="kicker__wrapper">
		<?php while ( $query->have_posts() ) : $query->the_post();
			get_template_part('loop');
		endwhile; wp_reset_postdata(); ?>
	</aside>
<?php endif;