var gulp = require('gulp'),
sass = require('gulp-sass'),
postcss = require('gulp-postcss'),
autoprefixer = require('autoprefixer'),
cssnano = require('gulp-cssnano'),
sourcemaps = require('gulp-sourcemaps'),
coffee = require('gulp-coffee'),
concat = require('gulp-concat'),
insert = require('gulp-insert');
uglify = require('gulp-uglify'),
rename = require('gulp-rename'),
replace = require('gulp-replace'),
watch = require('gulp-watch'),
imageResize = require('gulp-images-resizer'),
sourcemaps = require('gulp-sourcemaps'),
mmq = require('gulp-merge-media-queries'),
touch = require('gulp-touch-cmd'),
paths = {
  coffee: 'js/coffee.coffee',
  scripts: ['js/main.js', 'js/ajax.js', 'js/plugins.js', 'js/vendor/*.js'],
  styles: ['sass/*.scss', 'sass/*/*.scss'],
  header: 'js/header.js'
};

gulp.task('styles', function () {
  var processor = [
    autoprefixer({
			browsers: ['> 0.2%', 'last 3 versions', 'Firefox ESR', 'not dead'],
			grid: true,
			cascade: false
		}),
  ];
  return gulp.src('./sass/style.scss')
  	.pipe(sass({ sourceComments: true }).on('error', sass.logError))
    .pipe(postcss(processor))
    .pipe(gulp.dest('.'))
    .pipe(mmq())
    .pipe(cssnano({autoprefixer: false}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./css'))
    .pipe(touch()); /* fix to update modified time */
});
gulp.task('coffee', function() {
  return gulp.src('js/*.coffee')
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest('js'));
});
gulp.task('scripts', function() {
  return gulp.src(['node_modules/jquery-form/src/jquery.form.js', 'node_modules/picturefill/dist/picturefill.min.js', 'node_modules/lazysizes/lazysizes.js', 'js/plugins.js', 'js/coffee.js', 'js/ajax.js', 'js/main.js'])
    .pipe(concat('main.combined.js'))
    .pipe(replace('main.combined.js'))
    .pipe(gulp.dest('js'))
    .pipe(rename('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('js'));
});
gulp.task('header', function() {
  return gulp.src('js/header.js')
    .pipe(rename('header.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('js'));
});

// Watch
gulp.task('watch', function() {
  gulp.watch(paths.coffee, gulp.series('coffee', 'scripts'));
  gulp.watch(paths.scripts, gulp.series('scripts'));
  gulp.watch(paths.header, gulp.series('header'));
  gulp.watch(paths.styles, gulp.series('styles'));
});

gulp.task('touch', function() {
  return gulp.src('images/touch/*.png')
    // Android High Res
    .pipe(imageResize({
	    width: 196,
	    height: 196
	  }))
	  .pipe(rename({
		  basename: 'touch',
      suffix: '-android-highres'
    }))
    .pipe(gulp.dest('./images/'))
    // iPhone @3x
    .pipe(imageResize({
      width : 180,
      height : 180
    }))
    .pipe(rename({
      basename: 'touch',
      suffix: '-icon-iphone-@3x'
    }))
    .pipe(gulp.dest('./images/'))
    // iPad Pro @2x
    .pipe(imageResize({
      width : 167,
      height : 167
    }))
    .pipe(rename({
	    basename: 'touch',
	    suffix: '-icon-ipad-pro-@2x'
    }))
    .pipe(gulp.dest('./images/'))
    // iPad @2x
    .pipe(imageResize({
      width : 152,
      height : 152
    }))
    .pipe(rename({
      basename: 'touch',
      suffix: '-icon-ipad-@2x'
    }))
    .pipe(gulp.dest('./images/'))
    // Android
    .pipe(imageResize({
	    width: 128,
	    height: 128
	  }))
	  .pipe(rename({
		  basename: 'touch',
      suffix: '-android'
    }))
    .pipe(gulp.dest('./images/'))
    // iPhone @2x
    .pipe(imageResize({
      width : 120,
      height : 120
    }))
    .pipe(rename({
	    basename: 'touch',
      suffix: '-icon-iphone-@2x'
    }))
    .pipe(gulp.dest('./images/'))
    // iPhone @2x
    .pipe(imageResize({
      width : 76,
      height : 76
    }))
    .pipe(rename({
	    basename: 'touch',
      suffix: '-icon'
    }))
    .pipe(gulp.dest('./images/'))
  ; // end
});

gulp.task('default', gulp.series( 'coffee', gulp.parallel('watch', 'header', 'scripts', 'styles')));
gulp.task('build',  gulp.series('coffee', gulp.parallel('header', 'scripts', 'styles')));