jQuery(document).ready(function( $ ) {
	var loadmore = 'default';
	// Load More Click Events
	$('.load-more--blog').on('click', function(e){
		e.preventDefault();
		if ('filter' === loadmore) {
			loadMoreFilter();
		} else {
			loadMore();
		}
	});

	$('.load-more--search').on('click', function(e){
		e.preventDefault();
		loadMoreSearch();
	});

	// Load More for Blog 
	function loadMore(){
		var button = $('.load-more'),
		data = {
			'action': 'loadmore',
			'query': loadmore_params.posts,
			'page' : loadmore_params.current_page,
			'number_of_posts' : loadmore_params.number_of_posts
		}
		$.ajax({
			url : loadmore_params.ajaxurl, // AJAX handler
			data : data,
			type : 'POST',
			beforeSend : function ( xhr ) {
			},
			success : function( data ){
				console.log(data);
				if( data ) {
					addPosts(data, button);
					loadmore_params.current_page++;
				} else {
					button.hide(); // if no data, remove the button as well
				}
			}
		});
	}

	function addPosts(data, button){
		var count = 0;
		$(data).each(function(i){
			if ($(this).is('.item')) {
				var card = this;
				setTimeout(function(){
					$('.posts-container').append(card);
					imageFit($(card).find('.item__image img'));
				}, (i * 50));
				count++;
			}
		});
		if (10 > count) {
			button.hide();
		}
	}

// Load More function for Search Page
  function loadMoreSearch(){
    getFilters();
    var button = $('.load-more--search'),
    data = {
      'action': 'loadmore_search',
      'page' : loadmore_params.current_page,
      'search': searchValue
    }
    $.ajax({
      url : loadmore_params.ajaxurl, // AJAX handler
      data : data,
      type : 'POST',
      beforeSend : function ( xhr ) {
      },
      success : function( data ){
        console.log(data);
        if( data ) {
          addSearchPosts(data, button); 
          loadmore_params.current_page++;
        } else {
          button.hide(); // if no data, remove the button as well
        }
      }
    });
  }

  function getFilters() {
    searchValue = [];
    if ($('.search-form-interior__input').val()) {
      searchValue.push($('.search-form-interior__input').val());
    } else {
      searchValue = [];
    }
  }

	function addSearchPosts(data, button){
		var count = 0;
		console.log(data);
		$(data).each(function(i){
			if ($(this).is('.search-item')) {
				var card = this;
				setTimeout(function(){
					$('.search-item__container').append(card);
				}, (i * 50));
				count++;
			}
		});
		if (10 > count) {
			button.hide();
		}
	}


	//Search Filter for Blog
	$('#blog-search').on('submit', function(e){
		e.preventDefault();
		var filters = getSearchFilters();
		filterPosts(filters);
		loadmore = 'filter';
	});

	function filterPosts(filters){
		loadmore_params.current_page = 0;

		var button = $('.load-more--blog'),
	
		data = {
			'action': 'filter',
			'search': filters['search'],
		}
		$.ajax({
			url : loadmore_params.ajaxurl, // AJAX handler
			data : data,
			type : 'POST',
			beforeSend : function ( xhr ) {
			},

			success : function( data ){
				if( data ) {
					$('.load-more--blog').show();
					$('.posts-container').empty();
					// insert new posts
					addPosts(data, button);
					loadmore_params.current_page++;
				} 
				if ( data == 0 ) {
					button.hide();
					$('.posts-container').append('<p class="search-item__no-posts">No posts matched this search. Try searching something else.</p>');
				}
			}
		});
	}

	function getSearchFilters(){
		var filters = [];
		filters['search'] = ($('#blog-search-input').val()) ? $('#blog-search-input').val() : false;
		return filters;
	}

	//Load more for Blog with Filter
	function loadMoreFilter(){
		var button = $('.load-more--blog'),
		filters = getSearchFilters();

		data = {
			'action': 'loadmore_w_filter',
			'search': filters['search'],
			'page' : loadmore_params.current_page,
		}
		$.ajax({
			url : loadmore_params.ajaxurl, // AJAX handler
			data : data,
			type : 'POST',
			beforeSend : function ( xhr ) {
			},
			success : function( data ){
				if( data ) {
					// insert new posts
					addPosts(data, button);
					loadmore_params.current_page++;
				} else {
					button.hide(); // if no data, remove the button as well
				}
			}
		});
	}

});
