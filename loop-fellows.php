<a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>" class="carousel-people__item">
	<div class="carousel-people__image-wrapper">
		<?php
		if ( has_post_thumbnail() ) {
			$hand2x = wp_get_attachment_image_src(get_post_thumbnail_id(), 'small-img-@2x');
			$alt = get_post(get_post_thumbnail_id())->post_title; ?>
			<picture class="carousel-people__image">
				<img src="<?php echo $hand2x[0]; ?>" alt="<?php echo $alt ?>" />
			</picture>
		<?php } ?>
	</div>
	<div class="carousel-people__content-wrapper">
		<h2 class="carousel-people__hed-focus"><?php the_field('first_name'); ?> <?php the_field('last_name'); ?></h2>
		<h2 class="carousel-people__hed"><?php the_field('first_name'); ?><br> <?php the_field('last_name'); ?></h2>
		<p class="carousel-people__sub"><?php the_field('region'); ?></p>
	</div>
</a>