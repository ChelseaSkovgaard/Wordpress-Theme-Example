<?php
/**
 * @package WordPress
 * @subpackage Sample Custom Theme
 */

get_header(); ?>

<section class="entry" id="content" role="main">

	<?php if (have_posts()) : ?>
		<header class="entry__header">
			<h1 class="entry__hed">
				<?php // Archive Header
				switch (true) {
			    case (is_category()):
		        echo single_cat_title('', false);
		        break;
			    case (is_tag()):
			    	printf(__( '%s Tag Archive', 'samplecustom' ), single_tag_title('', false));
			    	break;
			    case (is_day()):
			    	printf(__( 'Archive for %s', 'samplecustom' ), get_the_time('F jS, Y'));
			    	break;
			    case (is_month()):
			    	printf(__( 'Archive for %s', 'samplecustom' ), get_the_time('F, Y'));
			    	break;
			    case (is_year()):
			    	printf(__( 'Archive for %s', 'samplecustom' ), get_the_time('Y'));
			    	break;
			    case (is_author()):
			    	printf(__( 'Author Archive for %s', 'samplecustom' ), get_the_author());
			    	break;
			    default:
			    	the_archive_title();
			  } ?>
			</h1>
		</header>
		<?php while (have_posts()) : the_post();
			get_template_part('loop');
		endwhile;
		get_template_part('includes/browse_entries');
	else : ?>

		<header class="entry__header">
			<h1 class="entry__hed">
				<?php // Nothing Found Headers
				switch (true) {
					case (is_category()):
						printf(__("Sorry, but there aren't any posts in the %s category yet.", 'samplecustom'), single_cat_title('', false));
						break;
					case (is_tag()):
						printf(__("Sorry, but there aren't any posts tagged %s yet.", 'samplecustom'), single_tag_title('', false));
						break;
					case (is_date()):
						_e("Sorry, but there aren't any posts with this date.", 'samplecustom');
						break;
					case (is_author()):
						$userdata = get_userdatabylogin(get_query_var('author_name'));
						printf(__("Sorry, but there aren't any posts by %s yet.", 'samplecustom'), $userdata->display_name);
						break;
					default:
						_e("No posts found.", 'samplecustom');
				} ?>
			</h1>
		</header>
		<div class="entry__body">
			<?php get_search_form(); ?>
		</div>
	<?php endif; ?>
	
</section>

<?php get_footer();