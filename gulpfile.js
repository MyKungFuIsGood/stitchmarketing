// Concatenate & Minify JS
var path = {
	script: 'src/js/*',
	less: 'src/less/*',
	watch: 'public/*.html'
};

var dirs = {
	src: 'src',
	dist: 'public',
	js: 'public/assets/js',
	css: 'public/assets/css'
};

// Include gulp
var gulp = require('gulp'); 
// Unsure how to get these to work with gulp-load-plugins
var autoprefixer = require('autoprefixer-core');
var mqpacker     = require('css-mqpacker');
var focus 		 = require('postcss-focus');

// Load all gulp plugins automatically and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

function onError(err) {
	plugins.util.beep();
	plugins.util.log(plugins.util.colors.red("-----------------------------"));
	plugins.util.log(plugins.util.colors.yellow("Error: "), err.message);
	plugins.util.log(plugins.util.colors.yellow("Line: "), err.loc.line);
	plugins.util.log(plugins.util.colors.yellow("Type: "), err.name);
	plugins.util.log(plugins.util.colors.red("-----------------------------"));
	this.emit('end');
}

gulp.task('script', function() {
	return gulp.src( path.script )
	.pipe(plugins.plumber({errorHandler: onError}))
	.pipe(plugins.babel())
	.pipe(plugins.concat('main.js'))
	.pipe(gulp.dest( dirs.js ))
	.pipe(plugins.uglify())
	.pipe(plugins.rename('main.min.js'))
	.pipe(gulp.dest( dirs.js ))
	.pipe(plugins.livereload());
});

gulp.task('less', function() {
	// Make sure our css is compatible with the last two versions of all browsers
	// For all ::hover styles duplicate a ::focus style
	// Condense mediaquery calls
	var processors = [
		autoprefixer({browsers: ['last 2 version']}),
		focus,
		mqpacker,
	];

	 gulp.src( 'src/less/main.less' )
	.pipe(plugins.plumber())
	.pipe(plugins.concat('main.css'))
	.pipe(plugins.less())
	.pipe(plugins.rucksack())
	.pipe(plugins.postcss( processors ))
	.pipe(plugins.minifyCss())
	.pipe(plugins.rename('main.min.css'))
	.pipe(gulp.dest( dirs.css ))
	.pipe(plugins.livereload());
});


// Bower Update Task
gulp.task('bower', function() {
	return plugins.bower();
});


// Migrate Vendor Dependencies 
gulp.task('vendor',['bower'], function() {

	//
	gulp.src( dirs.src + '/vendor/bootstrap/less/**/*' )
	.pipe(gulp.dest( dirs.src + '/less/bootstrap' ));

	//
	gulp.src( dirs.src + '/vendor/bootstrap/dist/js/bootstrap.min.js' )
	.pipe(gulp.dest( dirs.dist + '/assets/js/plugins' ));

	//
	gulp.src( dirs.src + '/vendor/jquery/dist/jquery.min.js' )
	.pipe(gulp.dest( dirs.dist + '/assets/js/plugins' ));

});

gulp.task('watch', function() {
	plugins.livereload.listen(3001);
	gulp.watch( path.script, ['script']);
	gulp.watch( path.less, ['less']);
	gulp.watch( path.watch ).on('change', function (event) {
		plugins.livereload.changed(event.path);
	});
});
