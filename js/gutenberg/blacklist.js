// Blacklisted Blocks & Styles (we don't need 'em)
wp.domReady(() => {
	// Blocks
	wp.blocks.unregisterBlockType( 'core/verse' );
	wp.blocks.unregisterBlockType( 'core/more' );
	wp.blocks.unregisterBlockType( 'core/nextpage' );
	// Block Styles
	wp.blocks.unregisterBlockStyle( 'core/pullquote', 'solid-color' );
	wp.blocks.unregisterBlockStyle( 'core/separator', 'dots' );
});