<a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>" class="grid-people__item">
	<div class="grid-people__image-wrapper">
		<?php require('featured_image_med.php'); ?>
	</div>
	<div class="grid-people__content-wrapper">
		<h2 class="grid-people__hed"><?php the_field('first_name'); ?> <?php the_field('last_name'); ?></h2>
		<p class="grid-people__sub"><?php ( has_term('staff', 'people_type') || has_term('board', 'people_type')) ? the_field('job_title') : the_field('region'); ?></p>
	</div>
</a>