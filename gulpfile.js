'use strict'

const _ = require('lodash')
    , gulp = require( 'gulp' )
    , gulpLoadPlugins = require( 'gulp-load-plugins' )
    , browserify = require( 'browserify' )
    , watchify = require( 'watchify' )
    , runSequence = require( 'run-sequence' )
    , babelify = require( 'babelify' )
    , source = require( 'vinyl-source-stream' )
    , buffer = require( 'vinyl-buffer' )
    , assign = _.assign

let isWatchify = false
const $ = gulpLoadPlugins()
const bundles = [
  {
    entries: ['./bundle/bootstrap.js'],
    output: 'bootstrap.js',
    extensions: ['.js'],
    destination: './build/'
  }
]


gulp.task('clean', function () {
    return gulp.src('build/', {read: false})
        .pipe($ .clean() );
});



/**
 * Tasks for JS
 */

// browserify with babelify the JS code, and watchify

const createBundle = options => {
  const opts = assign({}, watchify.args, {
    entries: options.entries,
    extensions: options.extensions,
    debug: true
  })

  let b = browserify(opts)
  b.transform(babelify.configure({
    // presets: ["es2015"],
    compact: false
  }))

  const rebundle = () =>
    b.bundle()
    // log errors if they happen
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source(options.output))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    // .pipe($.uglify())
    .pipe($.sourcemaps.write('../maps'))
    .pipe(gulp.dest(options.destination))

  if (isWatchify) {
    b = watchify(b)
    b.on('update', rebundle)
    b.on('log', $.util.log)
  }

  return rebundle()
}

gulp.task('scripts', () =>
  bundles.forEach( bundle =>
    createBundle( bundle )
  )
)

/**
 * Watch files for changes with watchify
 */

gulp.task('sizereport', function () {
  return gulp.src('dist/*')
  .pipe( $.sizereport() )
})


gulp.task('watch', () => {
  isWatchify = true
  runSequence(['scripts'])
})


gulp.task('default', () => {
  runSequence(['clean','watch'])
})
