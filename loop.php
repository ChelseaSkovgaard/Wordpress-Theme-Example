<article class="item">
	<div class="item__image-wrapper">
		<?php 
		$imgID = (has_post_thumbnail()) ? get_post_thumbnail_id() : get_field('default_post_image', 'options');
		if ($imgID && wp_attachment_is_image($imgID)) {
			$img = wp_get_attachment_image_src($imgID, 'large-img-@2x');
			$alt = get_post($imgID)->post_title; ?>
				<picture class="item__image">
					<img src="<?php echo $img[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)" />
				</picture>
		<?php } ?>
	</div>
	<div class="item__text-wrapper">
		<h2 class="item__hed"><?php the_title(); ?></h2>
		<p class="item__author">
			<?php	
			$blog_post_id = get_the_ID();
			$post_object = get_field('author');
			if( $post_object ):
				$post = $post_object;
				setup_postdata( $post ); 
				the_field('first_name'); echo " "; the_field('last_name'); 
				if( get_field('job_title') ) { echo ", "; the_field('job_title'); }
			?>
			<?php $post = $blog_post_id; setup_postdata( $post ); endif; ?>
			<?php	if( get_field('guest_author') ){
				the_field('guest_author');
			} ?>
		</p>
		<p class="item__dek"><?php the_excerpt(); ?></p>
		<a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>" class="button-link">Read More</a>
	</div>
</article>