jQuery(document).ready(function( $ ) {

	// Mobile Nav Open/Close
	$('.header__btn').on('click', function(){
		$('body').toggleClass('expand');
	});

	//close menu when click outside it
	$(document).on('touchend mouseup', function (e) {
		if (!$('.header').is(e.target) && $('.header').has(e.target).length === 0) {
			$('body').removeClass('expand');
		}
	});

	//Mobile Nav Sub Menus
	$('.nav__arrow--mobile').on('click', function(){
		$(this).siblings('.sub-menu').toggleClass('sub-menu--expand');
		$(this).siblings('.nav__link').toggleClass('nav__link--active');
		$(this).toggleClass('nav__arrow--active');
	});

	//Toggle Search Form
	$('.search-form__icon').click(function(e){
		$(this).toggleClass('search-form__icon--active');
		$('.search-form__input').toggleClass('search-form__input--active');
		$(this).parent('.search-form__inner').toggleClass('search-form__inner--active');
		$('.header__join-btn').toggleClass('header__join-btn--hide')
	});

	// Window Size Changing - Img Fit
	$(window).resize(function() {
		$('.item__image img, .feature__image img, .banner__image img, .post-grid__image img, .carousel-video__image img, .card__image img, .cta__image img, .marquee__image img, .grid-people__image img, .featured-image__image img').each(function(){
			imageFit(this);
		});
	});

	// Carousel Height
	$('.carousel-video').on('setPosition', function () {
    $(this).find('.slick-slide').height('auto');
    var slickTrack = $(this).find('.slick-track');
    var slickTrackHeight = $(slickTrack).height();
    $(this).find('.slick-slide').css('height', slickTrackHeight + 'px');
  });

  // Modal
	if ($('.text-modal').length) {
		$('.text-modal').each(function(i){
			var modal = $(this);
			var modalTarget = modal.attr('id');
			var openModal = $('a[href="#' + modalTarget + '"]');
			var closeModal = $(this).find('.text-modal__close');

			// Open Modal
			$(openModal).on('click', function(e){
				e.preventDefault();
				openTextModal(modal);
			});
			// Close modal (close button)
			$(closeModal).on('click', function(e){
				e.preventDefault();
				closeTextModal(modal);
			});
			// Close modal click
			$(window).on('click touchstart', function(e){
				if (e.target == $(modal)[0]) {
					e.preventDefault();
					closeTextModal(modal);
				}
			});
		});

		// Open Modal
		function openTextModal(modal){
			$('body').addClass('modal');
			modal.parents('.card').addClass('card--has-modal');
			modal.addClass('text-modal--show');
		}

		// Close Modal
		function closeTextModal(modal){
			$('body').removeClass('modal');
			modal.parents('.card').removeClass('card--has-modal');
			modal.removeClass('text-modal--show');
		}
	}

	// Video Modal
	if ($('.video-modal').length) {
		$('.video-modal').each(function(i){
			var modal = $(this);
			var modalTarget = modal.attr('id');
			var openModal = $('a[href="#' + modalTarget + '"]');
			var closeModal = $(this).find('.video-modal__close');
			var playerID = $(modal).find('.modal__video-player').attr('id').replace('player', '');

			// Open Modal
			$(openModal).on('click', function(e){
				e.preventDefault();
				openVideoModal(modal, playerID);
			});
			// Close modal (close button)
			$(closeModal).on('click', function(e){
				e.preventDefault();
				closeVideoModal(modal, playerID);
			});
			// Close modal click
			$(window).on('click touchstart', function(e){
				if (e.target == $(modal)[0]) {
					e.preventDefault();
					closeVideoModal(modal, playerID);
				}
			});
		});
		// Open Modal
		function openVideoModal(modal, playerID){
			$('body').addClass('modal');
			modal.addClass('video-modal--show');
			player[playerID].play();
		}
		// Close Modal
		function closeVideoModal(modal, playerID){
			player[playerID].pause();
			$('body').removeClass('modal');
			modal.removeClass('video-modal--show');
		}
	}

	// Remove/add titles from links on hover
	$('[title]').each(function(){
		$(this).data('original-title', $(this).attr('title'));
	}).hover(
	  function () {
			$(this).attr('title','')
	  }, function () {
			$(this).attr('title',$(this).data('original-title'))
	});

	//social share sticky
	function socialShareSticky(){
		var footerTop = $('.author').offset().top;
		var socialShareHeight = $('.share-links').outerHeight();
		var stopPoint = footerTop - socialShareHeight;

		if($(this).scrollTop() < socialShareTop) {
			socialShare.removeClass("share-links-fixed");
			socialShare.removeClass("share-links-stop");
		}
		if ($(this).scrollTop() > socialShareTop) {
			socialShare.addClass("share-links-fixed");
			socialShare.removeClass("share-links-stop");
		}
		if ($(this).scrollTop() >= stopPoint) {
			socialShare.removeClass("share-links-fixed");
			socialShare.addClass("share-links-stop");
		}
	}

	if($('.share-links').length) {
		var socialShare = $('.share-links');
		var socialShareTop = $('.share-links').offset().top;
		$(window).scroll(function () {
			socialShareSticky();
		});
	}

	//Fellow Alumni/Current Switch
	if($('#current').is(':checked')){
		$('#current-grid').show();
		$('#alumni-grid').hide();
	}
	if($('#alumni').is(':checked')){
		$('#alumni-grid').show();
		$('#current-grid').hide();
	}
	$('.toggle').change(function(e){
		if($('#current').is(':checked')){
			$('#current-grid').show();
			$('#alumni-grid').hide();
		}
		if($('#alumni').is(':checked')){
			$('#alumni-grid').show();
			$('#current-grid').hide();
		}
	})

	// Popup window
	$('.popup').click(function(event) {
    var width  = 575,
        height = 400,
        left   = ($(window).width()  - width)  / 2,
        top    = ($(window).height() - height) / 2,
        url    = this.href,
        opts   = 'status=1' +
                 ',width='  + width  +
                 ',height=' + height +
                 ',top='    + top    +
                 ',left='   + left;

    window.open(url, '_blank', opts);
    return false;
	});

}); // End Document Ready