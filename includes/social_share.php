<?php // Share links
$share_title = get_the_title();
$share_link = get_permalink(); ?>
<ul class="share-links">
	<li class="share-links__hed">
		Share
	</li>
	<li class="share-links__item share-links__item--facebook">
		<a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode($share_link); ?>" target="_blank" class="popup share-links__link">
			<span class="assistive-text"><?php _e('Share on Facebook', 'samplecustom'); ?></span>
			<svg class="share-links__icon share-links__icon--facebook"><use xlink:href="#facebook"></use></svg>
		</a>
	</li>
	<li class="share-links__item share-links__item--twitter">
		<a href="https://twitter.com/share?text=<?php echo urlencode($share_title); ?>&url=<?php echo urlencode($share_link); ?>" target="_blank" class="popup share-links__link">
			<span class="assistive-text"><?php _e('Share on Twitter', 'samplecustom'); ?></span>
			<svg class="share-links__icon share-links__icon--twitter"><use xlink:href="#twitter"></use></svg>
		</a>
	</li>
	<li class="share-links__item share-links__item--email">
		<a href="mailto:?&subject=<?php echo $share_title; ?>&body=<?php echo urlencode($share_link); ?>" class="share-links__link">
			<span class="assistive-text"><?php _e('Share via email', 'samplecustom'); ?></span>
			<svg class="share-links__icon share-links__icon--email"><use xlink:href="#email_icon"></use></svg>
		</a>
	</li>
</ul>
