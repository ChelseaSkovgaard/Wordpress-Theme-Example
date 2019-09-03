<?php
$partners = get_field('campaign_partners');
if( $partners ): ?>

	<h1 class="carousel-logos__header carousel-logos__header--feature">Campaign Partners</h1>

	<section class="carousel-logos carousel-logos--team">
		<?php foreach( $partners as $partner ): ?>
			<a href="/about-us/partners/" class="carousel-logos__card">
				<div class="carousel-logos__image-wrapper">
					<?php
						if ( has_post_thumbnail($partner->ID) ) {
							$tab2x = wp_get_attachment_image_src(get_post_thumbnail_id($partner->ID), 'medium-img-@2x');
							$alt = get_post(get_post_thumbnail_id())->post_title; ?>
							<picture class="carousel-logos__image">
								<img class="lazyload" data-srcset="<?php echo $tab2x[0]; ?>" alt="<?php echo $alt ?>">
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