<?php 
$post_object = get_field('featured_campaign');
$post_object_id = $post_object->id;
$args = array(
	'post_type' => 'fellowship',
	'posts_per_page' => -1,
	'post__not_in' => array($post_object_id),
);
$query = new WP_Query($args);
if ( $query->have_posts() ) : ?>
	<div class="card__grid">
		<?php while ( $query->have_posts() ) : $query->the_post(); 
			get_template_part('loop-card');
		endwhile; wp_reset_postdata(); ?>
	</div>
<?php endif;