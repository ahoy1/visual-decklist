var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');

var sass = require('gulp-sass');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');


gulp.task('js', function(){
	browserify('vdl.js')
		.bundle()
		.on('error', function(e){
			gutil.log(e);
		})
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('js'))
});

gulp.task('styles', function() {
  gulp.src(['css/scss/reset.scss', 'css/scss/styles.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(minifyCSS({compatibility: 'ie8'}))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
    .pipe(concat('vdl.min.css'))
    .pipe(gulp.dest('css/'))
});

//default task
gulp.task('default',function() {
    gulp.watch('vdl.js',['js']);
    gulp.watch('css/scss/*', ['styles'])
});
