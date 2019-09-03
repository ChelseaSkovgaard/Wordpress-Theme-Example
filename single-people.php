<?php
/**
 * @package WordPress
 * @subpackage Sample Custom Theme
 */

get_header();

if (have_posts()) : while (have_posts()) : the_post(); ?>

<section id="content" role="main">

	<header class="profile">
		<div class="profile__content">
			<div class="profile__image-wrapper">
				<?php get_template_part('includes/featured_image_med'); ?>
			</div>
			<div class="profile__header">
				<h1 class="profile__hed"><?php the_title(); ?></h1>
				<h3 class="profile__title"><?php the_field('job_title'); ?> </h3>
				<!-- Email or State depending on type -->
				<?php if ( has_term('staff', 'people_type') || has_term('board', 'people_type')) { ?>
					<a href="mailto:<?php the_field('email'); ?>" target="_top" class="profile__email"><?php the_field('email'); ?></a>
				<?php } else { ?>
					<p class="profile__sub"><?php the_field('region'); ?></p>
				<?php } ?>
				<?php get_template_part('includes/carousel_campaign_people'); ?>
			</div>
		</div>
	</header>

	<div class="entry__body">
		<?php the_content(); ?>
	</div>

</section>

<?php get_template_part('includes/cta');

endwhile; endif;

get_footer();