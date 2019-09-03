<?php
$campaigns = get_field('fellowship_campaigns');
if( $campaigns ): ?>
	<h1 class="carousel-logos__header carousel-logos__header--feature">Campaign Involvement</h1>
	<section class="carousel-logos carousel-logos--team">
		<?php foreach( $campaigns as $campaign ): ?>
			<a href="<?php echo get_permalink( $campaign->ID ); ?>" class="carousel-logos__card">
				<div class="carousel-logos__image-wrapper">
					<?php
						$imgID = get_field('campaign_logo', $campaign->ID);
						if ($imgID && wp_attachment_is_image($imgID)) {
							$hand2x = wp_get_attachment_image_src($imgID, 'small-img-@2x');
							$alt = get_post($imgID)->post_title; ?>
							<picture class="carousel-logos__image">
								<img class="lazyload" data-srcset="<?php echo $hand2x[0]; ?>" alt="<?php echo $alt ?>" >
								<noscript><img class="lazyload" data-srcset="<?php echo $hand2x[0]; ?>" alt="<?php echo $alt ?>"></noscript>
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