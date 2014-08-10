var gulp = require('gulp');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var shell = require('gulp-shell');
var open = require('open');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var PORT = 3000;

// Launch dev server.
gulp.task('server', function() {
  connect.server({
    root: 'public',
    port: PORT,
    livereload: true
  });
});

// Open browser.
gulp.task('open', ['server'], function() {
  open('http://localhost:' + PORT);
});

// Build TopoJSON for map.
gulp.task('map', shell.task(['./map.sh']));

// Copy data files.
gulp.task('data', ['map'], function() {
  return gulp.src(['tmp/east-asia.json', 'data/typhoons.json'])
    .pipe(gulp.dest('public/data'))
    .pipe(connect.reload());
});

// Copy HTML files.
gulp.task('html', function() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('public'))
    .pipe(connect.reload());
});

// Build JS.
gulp.task('js', function() {
  var options = {
    entries: ['./src/js/app.js']
  };
  return browserify(options)
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('public/js'))
    .pipe(connect.reload());
});

// Concat JS libraries.
gulp.task('lib', function() {
  var libs = 'node_modules/{d3/d3,d3-transform/src/d3-transform,topojson/topojson,Processing.js/processing}.js';
  return gulp.src(libs)
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('public/js'))
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('src/*.html', ['html']);
  gulp.watch('src/js/*.js', ['js']);
});

gulp.task('build', ['html', 'lib', 'js', 'data']);

gulp.task('default', ['build', 'open', 'watch']);
