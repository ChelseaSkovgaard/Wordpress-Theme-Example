<?php
/**
 * @package WordPress
 * @subpackage Sample Custom Site
 */

get_template_part('includes/head_top'); ?>

<div id="container">

	<?php if (is_page_template( 'page-donate.php' ) ) {
		echo '';
	} else { ?>
	<?php /*  Allow screen readers / text browsers to skip the navigation menu and get right to the good stuff. */ ?>
	<nav id="access" role="navigation">
		<h3><?php _e( 'Main menu', 'samplecustom' ); ?></h3>
		<a href="#content" title="<?php esc_attr_e( 'Skip to primary content', 'samplecustom' ); ?>"><?php _e( 'Skip to primary content', 'samplecustom' ); ?></a>
	</nav>

	<header role="header" class="header">
		<h1 class="header__hed">
			<a class="header__link" href="<?php echo get_option('home'); ?>/">
				<img src="<?php echo get_stylesheet_directory_uri(); ?>/images/logo.png" alt="<?php bloginfo('name'); ?>" class="header__logo"/>
				<span class="assistive-text"><?php bloginfo('name'); ?></span>
			</a>
		</h1>
		<button class="header__btn header__btn--open" type="button">
	    <svg class="header__icon header__icon--open">
	      <use xlink:href="#menu"></use>
	    </svg>
	  </button>
	  <button class="header__btn header__btn--close" type="button">
	    <svg class="header__icon header__icon--close">
	      <use xlink:href="#close"></use>
	    </svg>
		</button>
		
		<div class="header__nav-wrap">
			<?php // Primary Nav (set location)
				if ( has_nav_menu( 'primary' ) ) {
					wp_nav_menu(array(
						'theme_location' => 'primary',
						'fallback_cb' => false,
						'walker' => new Nav_Menu(),
						'walker_arg' => 'nav',
						'container_class' => 'nav',
						'menu_class' => 'nav__list'
					));
				} ?>
			<?php // Search
			get_search_form(); ?>

			<!-- Social Nav -->
			<div class="sm-wrapper-header">
				<?php get_template_part('includes/social_nav_header'); ?>
			</div>

			<!-- Donate dropdown -->
			<div class="donate-header">
				<a href="<?php the_field('donation_navigation_donate_link', 'options') ?>" class="button-link button-link--donate header__donate-btn" target="_blank" >
					<svg class="button-link__donate-icon">
					<use xlink:href="#heart"></use>
					</svg>
					Donate
				</a>
				<div class="donate-header__sub">
					<p class="donate-header__subtext"><?php the_field('donation_navigation_donate_subtext', 'options') ?></p>
					<a href="<?php the_field('donation_navigation_donate_subpage', 'options') ?>" class="donate-header__sublink">More Ways to Give<svg class="donate-header__icon">
					<use xlink:href="#right_arrow_thick"></use>
					</svg></a>
				</div>
			</div>

		</div>
	</header>
<?php } ?>