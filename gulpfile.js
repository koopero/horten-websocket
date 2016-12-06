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
var $ = gulpLoadPlugins()
var bundles = [
  {
    entries: ['./bundle/bootstrap.js'],
    output: 'bootstrap.js',
  },
  {
    entries: ['./bundle/HortenWebsocketClient.js'],
    output: 'HortenWebsocketClient.js',
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

var createBundle = options => {
  var opts = assign({}, watchify.args, {
    entries: options.entries,
    extensions: ['.js'],
    debug: true
  })

  let b = browserify(opts)
  // b.transform(babelify.configure({
  //   // plugins: ["transform-es2015-classes"],
  //   presets: ['es2015'],
  //   compact: false
  // }))

  b.transform(babelify, {
    global: true,
    ignore: /\/node_modules\/(?!horten\/)/,
    presets: ['es2015']
  })

  var rebundle = () =>
    b.bundle()
    // log errors if they happen
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source(options.output))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.size({ showFiles: true }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./build/'))

  if (isWatchify) {
    b = watchify(b)
    b.on('update', rebundle)
    b.on('log', $.util.log)
  }

  return rebundle()
}

gulp.task('scripts', ['clean'], () =>
  $.all( bundles.map( bundle =>
    createBundle( bundle )
  ) )
)

gulp.task('watch', () => {
  isWatchify = true
  runSequence(['scripts'])
})

gulp.task('default', ['clean','scripts','compress'] )

gulp.task('compress', ['scripts'], function (cb) {
  require('pump')([
        gulp.src('build/*.js'),
        $.uglify(),
        $.rename({
          extname: '.min.js'
        }),
        $.size({ showFiles: true }),
        gulp.dest('build')
    ],
    cb
  )
})
