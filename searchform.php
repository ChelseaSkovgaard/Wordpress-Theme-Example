<form method="get" id="searchform" class="search-form" role="search" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<div class="search-form__inner">
		<span class="search-form__icon"></span>
		<label class="assistive-text" for="s"><?php _e( 'Search for:', 'samplecustom' ); ?></label>
		<input class="search-form__input" type="search" name="s" placeholder="Search" id="search-input" value="" />
		<input id="search-submit" class="search-form__submit" type="submit" value="Search" />
	</div>
</form>


