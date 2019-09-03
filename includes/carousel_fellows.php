<?php // Home Page Fellow Carousel
$args = array(
	'post_type' => 'people',
	'posts_per_page' => 20,
	'orderby' => 'rand',
	'tax_query' => array(
		array(
			'taxonomy' => 'people_type',
			'field'    => 'slug',
			'terms'    => 'fellow',
		),
	),
);
$query = new WP_Query($args);
if ( $query->have_posts() ) : ?>
	<section class="carousel-people__section">
		<div class="carousel-people">
			<?php while ( $query->have_posts() ) : $query->the_post();
				get_template_part('loop-fellows');
			endwhile; wp_reset_postdata(); ?>
		</div>
	</section>
	<script>
		// shuffle peeps
		jQuery('.carousel-people__item').shuffle();
		//Homepage Fellow Carousel
		jQuery('.carousel-people').slick({
			centerMode: true,
			infinite: true,
			slidesToShow: 5,
			centerPadding: '30%',
			arrows: true,
			variableWidth: true,
			prevArrow: '<button type="button" class="slick-prev"><svg class="carousel__arrow"><use xlink:href="#carousel-arrow-left"></button>',
			nextArrow: '<button type="button" class="slick-next"><svg class="carousel__arrow"><use xlink:href="#carousel-arrow-right"></button>',
			responsive: [
				{
					breakpoint: 1200,
					settings: {
						slidesToShow: 3,
						centerPadding: '10%',
					}
				},
				{
					breakpoint: 600,
					settings: {
						slidesToShow: 1,
						centerPadding: '10%',
					}
				}
			]
		});
	</script>
<?php endif; ?>