<?php if( have_rows('video_slider_video') ):

	/* Get the Videos for Modals outside the carousel */
	while ( have_rows('video_slider_video') ) : the_row();
		$video_selection = get_sub_field('link');
		$video_thumbnail = get_sub_field('medium_image');
		if( $video_selection ):
			require(locate_template('includes/video_modal.php'));
			wp_reset_postdata();
		endif;
	endwhile;

	/* Set up the Carousel */ ?>
  <section class="carousel-video">
    <?php while ( have_rows('video_slider_video') ) : the_row();
			$video_selection = get_sub_field('link');
			$video_thumbnail = get_sub_field('medium_image');
			if( $video_selection ): ?>
				<?php $vimeo_url = get_sub_field('link');
				// Get Video ID to link the card to the modal video
				$i = (isset($i)) ? $i : 0;
				$url_parts = parse_url($vimeo_url);
				if (stripos($url_parts['host'], 'vimeo') !== false) {
					$vimeoID = str_replace('/', '', $url_parts['path']);
				}
				$videoID = $vimeoID; ?>
				<a href="#modal_<?php echo $videoID; ?>" class="carousel-video__card">
					<div class="carousel-video__image">
						<img src="<?php echo $video_thumbnail; ?>" alt="" onload="imageFit(this)" />
					</div>
					<div class="carousel-video__content">
						<svg class="carousel-video__icon">
							<use xlink:href="#play"></use>
						</svg>
						<h3 class="carousel-video__title"><?php the_sub_field('title'); ?></h3>
					</div>
				</a>
				<?php wp_reset_postdata();
				$i++;
			endif;
		endwhile; ?>
	</section>

	<script>
		jQuery('.carousel-video').on('init', function(event, slick){
			jQuery('.carousel-video img').each(function(){
				imageFit(this);
			});
		});
		//Video Carousel
		jQuery('.carousel-video').slick({
			centerMode: true,
			centerPadding: '10%',
			infinite: true,
			slidesToShow: 4,
			arrows: true,
			prevArrow: '<button type="button" class="slick-prev"><svg class="carousel__arrow"><use xlink:href="#carousel-arrow-left"></button>',
			nextArrow: '<button type="button" class="slick-next"><svg class="carousel__arrow"><use xlink:href="#carousel-arrow-right"></button>',
			responsive: [
				{
					breakpoint: 1280,
					settings: {
						centerMode: true,
						slidesToShow: 3
					}
				},
				{
					breakpoint: 768,
					settings: {
						centerMode: true,
						slidesToShow: 2
					}
				},
				{
					breakpoint: 480,
					settings: {
						centerMode: true,
						slidesToShow: 1
					}
				}
			]
		});

	</script>
	
<?php endif;