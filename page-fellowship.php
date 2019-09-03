<?php
/**
 * Template Name: Fellowship Page
 * @package WordPress
 * @subpackage Sample Custom Theme
 */

get_header();

if (have_posts()) : while (have_posts()) : the_post();
?>

	<header class="marquee marquee--interior">
		<div class="marquee__image-wrapper">
			<?php get_template_part('includes/featured_image_marq'); ?>
		</div>
		<h1 class="marquee__hed"><span class="marquee__hed-wrapper"><?php the_title(); ?></span></h1>
	</header>

	<section class="feature">
		<div class="feature__image-wrapper">
			<?php
			$imgID = get_field('intro_section_image');
			if ($imgID && wp_attachment_is_image($imgID)) {
				$desk2x = wp_get_attachment_image_src($imgID, 'large-img-@2x');
				$alt = get_post($imgID)->post_title; ?>
				<picture class="feature__image">
					<img class="lazyload" data-srcset="<?php echo $desk2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
				</picture>
			<?php } ?>
		</div>
		<div class="feature__text-wrapper feature__text-wrapper--right">
			<h2 class="feature__hed"><?php the_field('intro_section_header') ?></h2>
			<p class="feature__dek"><?php the_field('intro_section_description') ?></p>
			<a href="<?php the_field('intro_section_button_link') ?>" class="button-link feature__button"><?php the_field('intro_section_button_text') ?></a>
		</div>
	</section>

	<?php if( have_rows('fellowship_cards') ): ?>
		<section class="card__grid">
   		<?php while ( have_rows('fellowship_cards') ) : the_row(); ?>
			 <article class="card">
				<div class="card__image-wrapper">
					<?php
					$imgID = get_sub_field('image');
					if ($imgID && wp_attachment_is_image($imgID)) {
						$tab2x = wp_get_attachment_image_src($imgID, 'medium-img-@2x');
						$alt = get_post($imgID)->post_title; ?>
						<picture class="card__image">
							<img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>" onload="imageFit(this)">
							<noscript><img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>"></noscript>
						</picture>
					<?php } ?>
				</div>
				<div class="card__content-wrapper">
					<h2 class="card__hed"><?php the_sub_field('header'); ?></h2>
					<p class="card__dek"><?php the_sub_field('subtext'); ?></p>
					<a href="<?php the_sub_field('button_link'); ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>" class="button-link card__button"><?php the_sub_field('button_text'); ?></a>
				</div>
			</article>
		<?php endwhile; ?>
	</section>
<?php endif;?>

<?php get_template_part('includes/cta'); ?>

<?php endwhile; endif;

get_footer();