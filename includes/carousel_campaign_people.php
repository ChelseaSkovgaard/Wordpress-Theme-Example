<?php
	$campaigns = get_posts(array(
		'post_type' => 'campaign',
		'meta_query' => array(
			array(
				'key' => 'campaign_fellows', // name of custom field
				'value' => '"' . get_the_ID() . '"',
				'compare' => 'LIKE'
			)
		)
	));
	?>
	<?php if( $campaigns ): ?>
	<h1 class="carousel-logos__header">Campaign Involvement</h1>
	<section class="carousel-logos carousel-logos--team">
		<?php foreach( $campaigns as $campaign ): ?>
			<a href="<?php echo get_permalink( $campaign->ID ); ?>" class="carousel-logos__card">
				<div class="carousel-logos__image-wrapper">
					<?php
						$imgID = get_field('campaign_logo', $campaign->ID);
						if ($imgID && wp_attachment_is_image($imgID)) {
							$tab2x = wp_get_attachment_image_src($imgID, 'medium-img-@2x');
							$alt = get_post($imgID)->post_title; ?>
							<picture class="logo__image">
								<img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>" >
								<noscript><img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>"></noscript>
							</picture>
					<?php } ?>
				</div>
			</a>
		<?php endforeach; ?>
	</section>
	<script>
		//Logo Carousel
		jQuery('.carousel-logos').slick({
			infinite: true,
			slidesToShow: 5,
			arrows: true,
			prevArrow: '<button type="button" class="slick-prev"><svg class="carousel__arrow"><use xlink:href="#carousel-arrow-left"></button>',
			nextArrow: '<button type="button" class="slick-next"><svg class="carousel__arrow"><use xlink:href="#carousel-arrow-right"></button>',
			responsive: [
				{
					breakpoint: 768,
					settings: {
						slidesToShow: 2
					}
				}
			]
		});
	</script>
<?php endif; ?>