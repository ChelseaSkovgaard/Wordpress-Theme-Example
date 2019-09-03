<?php
$post_object = get_field('author');
if( $post_object ){
	$post = $post_object;
	setup_postdata( $post );
	$excerpt = get_the_excerpt(); ?>
	<div class="author">
		<div class="author__image-wrapper">
			<?php include('includes/featured_image.php'); ?>
		</div>
		<div class="author__content-wrapper">
			<h2 class="author__hed">
				<?php the_field('first_name'); echo " "; the_field('last_name');
					?>
			</h2>
			<h3 class="author__sub"><?php ( has_term('staff', 'people_type') || has_term('board', 'people_type')) ? the_field('job_title') : the_field('region'); ?></h3>
			<div class="author__dek">
				<?php echo $excerpt; ?>
			</div>
		</div>
	</div>
<?php } wp_reset_postdata();  ?>
<?php if(get_field('guest_author')){  ?>
	<div class="author author--guest">
		<div class="author__content-wrapper">
			<h2 class="author__hed">
				<?php the_field('guest_author');
				?>
			</h2>
		</div>
	</div>
<?php } ?>

