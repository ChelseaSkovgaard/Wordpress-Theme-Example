<article class="card">
	<div class="card__image-wrapper">
		<?php require('featured_image_med.php'); ?>
	</div>
	<div class="card__content-wrapper">
		<h2 class="card__hed"><?php the_title(); ?></h2>
		<p class="card__dek"><?php the_excerpt(); ?></p>
		<a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>" class="button-link card__button">Read More</a>
	</div>
</article>