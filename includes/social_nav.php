<nav class="sm-nav">
	<?php if (get_field('twitter', 'options')) { ?>
			<a href="<?php the_field('twitter', 'options'); ?>" class="sm-nav__link" target="_blank">
				<span class="assistive-text"><?php printf( __( '%s on Twitter', 'samplecustom' ), get_bloginfo('name')); ?></span>
				<svg class="sm-nav__icon sm-nav__icon--twitter"><use xlink:href="#twitter"></use></svg>
			</a>
	<?php }
	if (get_field('facebook', 'options')) { ?>
		<a href="<?php the_field('facebook', 'options'); ?>" class="sm-nav__link" target="_blank">
			<span class="assistive-text"><?php printf( __( '%s on Facebook', 'samplecustom' ), get_bloginfo('name')); ?></span>
			<svg class="sm-nav__icon sm-nav__icon--facebook"><use xlink:href="#facebook"></use></svg>
		</a>
	<?php }
	if (get_field('instagram', 'options')) { ?>
		<a href="<?php the_field('instagram', 'options'); ?>" class="sm-nav__link" target="_blank">
			<span class="assistive-text"><?php printf( __( '%s on Instagram', 'samplecustom' ), get_bloginfo('name')); ?></span>
			<svg class="sm-nav__icon sm-nav__icon--instagram"><use xlink:href="#instagram"></use></svg>
		</a>
	<?php }
	if (get_field('youtube', 'options')) { ?>
		<a href="<?php the_field('youtube', 'options'); ?>" class="sm-nav__link" target="_blank">
			<span class="assistive-text"><?php printf( __( '%s on YouTube', 'samplecustom' ), get_bloginfo('name')); ?></span>
			<svg class="sm-nav__icon sm-nav__icon--youtube"><use xlink:href="#youtube"></use></svg>
		</a>
	<?php }
	if (get_field('snapchat', 'options')) { ?>
		<a href="<?php the_field('snapchat', 'options'); ?>" class="sm-nav__link" target="_blank">
			<span class="assistive-text"><?php printf( __( '%s on Snapchat', 'samplecustom' ), get_bloginfo('name')); ?></span>
			<svg class="sm-nav__icon sm-nav__icon--snapchat"><use xlink:href="#snapchat"></use></svg>
		</a>
	<?php } ?>
</nav>
