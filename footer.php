<?php
/**
 * @package WordPress
 * @subpackage Sample Custom Theme
 */
?>
 <?php if (is_page_template( 'page-donate.php' ) ) {
	 echo '';
 } else { ?>
<footer class="footer">
	<div class="footer__wrapper">
		<div class="footer__column--hed">
			<h1 class="footer__hed">
				<a class="footer__link" href="<?php echo get_option('home'); ?>/">
					<img src="<?php echo get_stylesheet_directory_uri(); ?>/images/logo.png" alt="<?php bloginfo('name'); ?>" class="footer__logo"/>
					<span class="assistive-text"><?php bloginfo('name'); ?></span>
				</a>
			</h1>
			<a href="<?php the_field('donation_navigation_donate_link', 'options') ?>" target="_blank" class="button-link button-link--donate footer__donate-btn footer__donate-btn--mobile">
				<svg class="button-link__donate-icon">
				<use xlink:href="#heart"></use>
				</svg>
				Donate
			</a>
			<?php get_template_part('includes/social_nav_footer'); ?>
		</div>
		<div class="footer__column">
			<?php
			wp_nav_menu(array(
				'menu' => 'footer-nav-1',
				'fallback_cb' => false,
				'walker' => new Nav_Menu(),
				'walker_arg' => 'nav',
				'container_class' => 'nav',
				'menu_class' => 'nav__list'
			)); ?>
		</div>
		<div class="footer__column">
			<?php
			wp_nav_menu(array(
				'menu' => 'footer-nav-2',
				'fallback_cb' => false,
				'walker' => new Nav_Menu(),
				'walker_arg' => 'nav',
				'container_class' => 'nav',
				'menu_class' => 'nav__list'
			)); ?>
		</div>
		<div class="footer__column">
			<?php
			wp_nav_menu(array(
				'menu' => 'footer-nav-3',
				'fallback_cb' => false,
				'walker' => new Nav_Menu(),
				'walker_arg' => 'nav',
				'container_class' => 'nav',
				'menu_class' => 'nav__list'
			)); ?>
		</div>
		<a href="<?php the_field('donation_navigation_donate_link', 'options') ?>" class="button-link button-link--donate footer__donate-btn footer__donate-btn--desktop" target="_blank">
				<svg class="button-link__donate-icon">
				<use xlink:href="#heart"></use>
				</svg>
				Donate
			</a>
	</div>
	<a href="/privacy-policy/" class="footer__pp">Privacy Policy</a>
</footer>
	<?php } ?>
</div> <!--! end of #container -->

<?php wp_footer();

global $vimeo_players;
if (isset($vimeo_players) && is_array($vimeo_players)) { ?>
	<script src="<?php echo get_stylesheet_directory_uri() . '/js/vendor/player.js'; ?>"></script>
	<script>
		var player = [];
    <?php // loop through players
		foreach($vimeo_players as $key => $player) { ?>

			var options<?php echo $key ?> = {
	        id: <?php echo $player ?>,
	        width: 800,
	        color: 'ffffff',
	        title: false,
	        portrait: true,
	        byline: false
	    };
			player[<?php echo $key ?>] = new Vimeo.Player('<?php echo 'player' . $key ?>', options<?php echo $key ?>);
			player[<?php echo $key ?>].on('pause', function(data) {
				videoComplete();
			});
		<?php } ?>
	</script>

<?php }

get_template_part('images/sprite'); ?>

</body>
</html>