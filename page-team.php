<?php
/**
 * Template Name: Team Landing Page
 * @package WordPress
 * @subpackage Sample Custom Theme
 */

get_header();

if (have_posts()) : while (have_posts()) : the_post(); ?>

	<section id="content" role="main">

		<header class="marquee marquee--interior">
			<div class="marquee__image-wrapper">
				<?php get_template_part('includes/featured_image_marq'); ?>				
			</div>		
			<h1 class="marquee__hed marquee__hed--desktop"><span class="marquee__hed-wrapper"><?php the_title(); ?></span></h1>
		</header>

		<?php if( have_rows('team_cards') ): ?>
			<?php while ( have_rows('team_cards') ) : the_row(); ?>
				<section class="item">
					<?php get_template_part('includes/acf_image_item'); ?>
					<div class="item__text-wrapper">
						<h2 class="item__hed"><?php the_sub_field('header');?></h2>
						<p class="item__dek"><?php the_sub_field('description');?></p>
						<a href="<?php the_sub_field('button_link');?>" class="button-link"><?php the_sub_field('button_text');?></a>
					</div>
				</section>
			<?php endwhile; ?>
		<?php endif;?>

	</section>

<?php get_template_part('includes/cta'); ?>	

<?php endwhile; endif;

get_footer();