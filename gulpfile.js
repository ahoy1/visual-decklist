var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');


gulp.task('js', function(){
	browserify('vdl.js')
		.bundle()
		.on('error', function(e){
			gutil.log(e);
		})
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('js'))
});



//default task
gulp.task('default',function() {
    gulp.watch('vdl.js',['js']);
});