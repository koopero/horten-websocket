var gulp = require('gulp')
var gutil = require('gulp-util')
var rename = require('gulp-rename')
var browserify = require('gulp-browserify')

// Basic usage
gulp.task('bundle', function() {
    // Single entry point to browserify
    gulp.src('./client.js')
    .pipe(browserify({
      insertGlobals : true,
      debug : !gulp.env.production
    }))
    // Rename the destination file
    .pipe(rename('horten-websocket.js'))

    // Output to the build directory
    .pipe(gulp.dest('build/'));

})


var uglify = require('gulp-uglify')

gulp.task('compress', ['bundle'], function (cb) {
  gulp.src('build/horten-websocket.js')
  .pipe( uglify() )
  .pipe( rename('horten-websocket.min.js') )
  .pipe( gulp.dest('build/') )
})


var sizereport = require('gulp-sizereport')

gulp.task('sizereport', ['compress'], function () {
  return gulp.src('build/*')
    .pipe(sizereport())
})


gulp.task('default', [
  'bundle',
  'compress',
  'sizereport'
])
