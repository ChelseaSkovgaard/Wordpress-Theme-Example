
// Image Fit (used in onload or within doc ready) - It lives here b/c images can load before the dom is finished loading
function imageFit(img){
	var container = jQuery(img).parents('[class$="__image"],[class*="__image "]');
	if (container.innerHeight() > jQuery(img).height()) {
		jQuery(img).css({
			'height': '100%',
			'width': 'auto'
		});
	} else if (container.width() > jQuery(img).width()) {
		jQuery(img).removeAttr('style');
	}
}

// Shuffle elements
(function($){
  $.fn.shuffle = function() {
    var allElems = this.get(),
      getRandom = function(max) {
        return Math.floor(Math.random() * max);
      },
      shuffled = $.map(allElems, function(){
        var random = getRandom(allElems.length),
          randEl = $(allElems[random]).clone(true)[0];
        allElems.splice(random, 1);
        return randEl;
     });
    this.each(function(i){
      $(this).replaceWith($(shuffled[i]));
    });
    return $(shuffled);
  };
})(jQuery);

function videoComplete() {
}
