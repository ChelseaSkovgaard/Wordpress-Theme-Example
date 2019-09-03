<?php 
$sticky = get_option( 'sticky_posts' );
$args = array(
	'posts_per_page' => 1,
	'post__in'  => $sticky,
	'ignore_sticky_posts' => 1
);
$query = new WP_Query($args);
if ( $query->have_posts() ) : ?>
	<?php while ( $query->have_posts() ) : $query->the_post(); ?>
		<article class="post-grid__highlight" id="post-<?php the_ID(); ?>">
			<a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>" class="post-grid__link-highlight">
				<div class="post-grid__image-wrapper">
					<?php require('featured_image_med.php'); ?>
				</div>
				<div class="post-grid__content">
					<h1 class="post-grid__hed"><?php the_title(); ?></h1>
					<p class="post-grid__author">By 
						<?php	
							$post_object = get_field('author');
							if( $post_object ){
								$post = $post_object;
								setup_postdata( $post ); 
								the_field('first_name'); echo " "; the_field('last_name'); echo ", "; the_field('job_title');
							} else {
								the_field('guest_author');
							} wp_reset_postdata(); 
						?></p>
					<p class="post-grid__dek"><?php the_excerpt(); ?></p>
				</div>
			</a>
		</article>
	<?php endwhile; wp_reset_postdata(); ?>
<?php endif;