<nav class="sm-nav">
<?php if (get_field('social_links_facebook', 'options')) { ?>
		<a href="<?php the_field('social_links_facebook', 'options'); ?>" class="sm-nav__link" target="_blank">
			<span class="assistive-text"><?php printf( __( '%s on Facebook', 'samplecustom' ), get_bloginfo('name')); ?></span>
			<svg class="sm-nav__icon sm-nav__icon--facebook"><use xlink:href="#facebook"></use></svg>
		</a>
	<?php } 
	if (get_field('social_links_instagram', 'options')) { ?>
		<a href="<?php the_field('social_links_instagram', 'options'); ?>" class="sm-nav__link" target="_blank">
			<span class="assistive-text"><?php printf( __( '%s on Instagram', 'samplecustom' ), get_bloginfo('name')); ?></span>
			<svg class="sm-nav__icon sm-nav__icon--instagram"><use xlink:href="#instagram"></use></svg>
		</a>
	<?php }
 if (get_field('social_links_twitter', 'options')) { ?>
			<a href="<?php the_field('social_links_twitter', 'options'); ?>" class="sm-nav__link" target="_blank">
				<span class="assistive-text"><?php printf( __( '%s on Twitter', 'samplecustom' ), get_bloginfo('name')); ?></span>
				<svg class="sm-nav__icon sm-nav__icon--twitter"><use xlink:href="#twitter"></use></svg>
			</a>
	<?php } ?>
</nav>
