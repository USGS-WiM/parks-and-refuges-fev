'use strict';

//load dependencies
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    size = require('gulp-size'),
    uglify = require('gulp-uglify-es').default,
    useref = require('gulp-useref'),
    cleanCSS = require('gulp-clean-css'),
    connect = require('gulp-connect'),
    autoprefixer = require('gulp-autoprefixer'),
    filter = require('gulp-filter'),
    del = require('del'),
    open = require('open'),
    gutil = require('gulp-util')


//less
gulp.task('less', function () {
    return gulp.src(['node_modules/wim-styles/template/less/base.less'])
        .pipe(less())
        .pipe(gulp.dest('src/styles'))
        .pipe(gulp.dest('build/styles'))
});

// Icons
gulp.task('icons', function () {
    return gulp.src(['node_modules/font-awesome/fonts/*.*'])
        .pipe(gulp.dest('build/fonts'));
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src(['src/**/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(size());
});

// Styles
gulp.task('styles', function () {
    return gulp.src(['src/styles/main.css'])
        .pipe(autoprefixer('last 1 version'))
        .pipe(gulp.dest('src/styles'))
        .pipe(size());
});

// HTML
gulp.task('html', ['styles', 'scripts', 'icons'], function () {
    var jsFilter = filter('**/*.js', { restore: true });
    var cssFilter = filter('**/*.css', { restore: true });

    return gulp.src('src/*.html')
        .pipe(useref())
        .pipe(jsFilter)
        .pipe(uglify())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(cleanCSS({ processImport: false }))
        .pipe(cssFilter.restore)
        .pipe(gulp.dest('build/'))
        .pipe(size())
        .pipe(connect.reload());
});

// Images
gulp.task('images', function () {
    return gulp.src([
        'src/images/**/*',
        'src/lib/images/*'])
        .pipe(gulp.dest('build/images'))
        .pipe(size());
});

// Leaflet
gulp.task('leaflet', function () {
    return gulp.src('node_modules/leaflet/dist/images/**/*')
        .pipe(gulp.dest('build/images'))
        .pipe(size());
});

// Clean
gulp.task('clean', function (cb) {
    del([
        'build/fonts/**',
        'build/styles/**',
        'build/scripts/**',
        'build/images/**'
    ], cb);
});

// build build
gulp.task('build', ['html', 'images', 'leaflet']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// Watch
gulp.task('watch', ['default', 'connect', 'serve'], function () {
    // start up
});

// Connect
gulp.task('connect', function () {
    connect.server({
        root: 'build',
        livereload: true,
        port: 9000
    });
});

// Open
gulp.task('serve', ['connect'], function () {
    open("http://localhost:9000", { url: true });
});
