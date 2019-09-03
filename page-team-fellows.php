<?php
/**
 * Template Name: Team Fellows Page
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

		<?php $team_content = get_field('team_description');
		if(!empty($team_content)): ?>
			<div class="feature--team">
				<p class="feature__dek"><?php the_field('team_description');?></p>
				<?php $campaigns = get_field('team_campaigns');
				if( $campaigns ): ?>
					<section class="carousel-logos carousel-logos--team">
						<?php foreach( $campaigns as $campaign ): ?>
							<a href="<?php echo get_permalink( $campaign->ID ); ?>" class="carousel-logos__card">
								<div class="carousel-logos__image-wrapper">
									<?php
										$imgID = get_field('campaign_logo', $campaign->ID);
										if ($imgID && wp_attachment_is_image($imgID)) {
											$hand2x = wp_get_attachment_image_src($imgID, 'small-img-@2x');
											$alt = get_post($imgID)->post_title; ?>
											<picture class="logo__image">
												<img class="lazyload" data-srcset="<?php echo $hand2x[0]; ?>" alt="<?php echo $alt ?>">
												<noscript><img class="lazyload" data-srcset="<?php echo $hand2x[0]; ?>" alt="<?php echo $alt ?>"></noscript>
											</picture>
									<?php } ?>
								</div>
							</a>
						<?php endforeach; ?>
					</section>
				<?php endif; ?>
			</div>
		<?php endif; ?>

		<?php get_template_part('includes/fellow_toggle');?>

		<?php // Current Fellows
		$args = array(
			'post_type' => 'people',
			'posts_per_page' => -1,
			'meta_key'			=> 'last_name',
			'orderby'			=> 'meta_value',
			'order'				=> 'ASC',
			'tax_query' => array(
				array(
					'taxonomy' => 'fellow_status',
					'field'    => 'slug',
					'terms'    => 'current',
				),
			),
		);
		$query = new WP_Query($args);
		if ( $query->have_posts() ) : ?>
			<section class="grid-people__section" id="current-grid">
				<h2 class="grid-people__header"><?php the_field('team_people_header'); ?><?php the_field('type_of_people_to_display');?></h2>
				<div class="grid-people__grid">
					<?php while ( $query->have_posts() ) : $query->the_post();
						get_template_part('loop-people');
					endwhile; wp_reset_postdata(); ?>
				</div>
			</section>
		<?php endif; ?>

		<?php // Alumni Fellows
		$args = array(
			'post_type' => 'people',
			'posts_per_page' => -1,
			'meta_key'			=> 'last_name',
			'orderby'			=> 'meta_value',
			'order'				=> 'ASC',
			'tax_query' => array(
				array(
					'taxonomy' => 'fellow_status',
					'field'    => 'slug',
					'terms'    => 'alumni',
				),
			),
		);
		$query = new WP_Query($args);
		if ( $query->have_posts() ) : ?>
			<section class="grid-people__section" id="alumni-grid">
				<h2 class="grid-people__header"><?php the_field('team_people_header'); ?><?php the_field('type_of_people_to_display');?></h2>
				<div class="grid-people__grid">
					<?php while ( $query->have_posts() ) : $query->the_post();
						get_template_part('loop-people');
					endwhile; wp_reset_postdata(); ?>
				</div>
			</section>
		<?php endif; ?>

		<?php get_template_part('includes/cta'); ?>
		
	</section>


<?php endwhile; endif;

get_footer();