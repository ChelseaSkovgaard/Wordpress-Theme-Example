<?php
$vimeo_url = get_sub_field('link');
// Get Video ID and add player
$i = (isset($i)) ? $i : 0;
$url_parts = parse_url($vimeo_url);

if (stripos($url_parts['host'], 'vimeo') !== false) {
	$vimeoID = str_replace('/', '', $url_parts['path']);
	// Set $vimeo_players array for footer
	global $vimeo_players;
	$vimeo_players[$i] = $vimeoID;
}
$videoID = $vimeoID; ?>

<div class="video-modal" id="modal_<?php echo $videoID; ?>">
	<a href="#" class="video-modal__close">
		<span class="assistive-text">Close</span>
		<svg class="video-modal__close-icon"><use xlink:href="#close"></use></svg>
  </a>
	<div class="video-modal__inner">
		<div id="player<?php echo $i; ?>" class="modal__video-player"></div>
	</div>
</div>

<?php $i++; ?>