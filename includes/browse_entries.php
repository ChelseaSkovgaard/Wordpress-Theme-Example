<?php // Single post (Prev/Next)
if (is_single()) { ?>

	<nav class="pagination pagination--single">
		<?php previous_post_link('%link', __( '&#171;&nbsp;Previous', 'samplecustom' ));
		next_post_link('%link', __( 'Next&nbsp;&#187;', 'samplecustom' )); ?>
	</nav>

<?php // archives, index, search
} else if (is_archive() || is_search() || is_home()) {
	sc_custom_pagination($query->max_num_pages, '', $paged);
}