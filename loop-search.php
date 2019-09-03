<article class="search-item">
	<a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>" class="search-item__hed"><?php the_title(); ?></a>
	<p class="item__dek">
		<?php the_excerpt(); ?>
	</p>
</article>