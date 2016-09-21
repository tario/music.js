var gulp = require("gulp");
var rename = require('gulp-rename');
var concat = require('gulp-concat')
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');
var sourcemaps = require('gulp-sourcemaps');

var DEST = "dist/"
gulp.task("build", ["build-lib", "build-site"]);
gulp.task("build-dev", ["build-lib-dev", "build-site-dev"]);
gulp.task("default", ["build-dev", "webserver", "watch"]);

gulp.task('webserver', function() {
  connect.server({livereload: true});
});

gulp.task('watch', function() {
    gulp.watch('site/**/*.js', ['build-site-dev']);
    gulp.watch('site/templates/*', ['build-site-dev']);
    gulp.watch('css/*', ['build-site-dev']);
    gulp.watch('*.html', ['build-site-dev']);
    gulp.watch('src/**/*.js', ['build-lib-dev']);
})

gulp.task('build-lib-dev', function(cb) {
  return gulp.src(["src/lib/*.js", "src/lib/recorder/WebAudioRecorder.min.js", "src/typecast.js", "src/music.js", "src/music/**/*.js"])
            .pipe(concat("music.js"))
            .pipe(gulp.dest(DEST))
            .pipe(connect.reload());
});

gulp.task('build-site-dev', function(cb) {
  return gulp.src([
            "site/lib/*.js", 
            "site/lib/*/*.js", 
            "site/app.js", 
            "site/*.js", 
            "site/directives/*.js", 
            "site/services/*.js", 
            "site/lib/codemirror/**/*.js"])
            .pipe(concat("site.js"))
            .pipe(gulp.dest(DEST))
            .pipe(connect.reload());
});

gulp.task('build-lib', function(cb) {
  return gulp.src(["src/lib/*.js", "src/typecast.js", "src/music.js", "src/music/**/*.js"])
            .pipe(sourcemaps.init())
              .pipe(concat("music.js"))
              .pipe(gulp.dest(DEST))
              .pipe(uglify())
              .pipe(rename({extname: '.min.js'}))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest(DEST));
});

gulp.task('build-site', function(cb) {
  return gulp.src(["site/lib/*.js", "site/lib/*/*.js", "site/app.js", "site/*.js", "site/lib/codemirror/**/*.js"])
            .pipe(sourcemaps.init())
              .pipe(concat("site.js"))
              .pipe(gulp.dest(DEST))
              .pipe(uglify())
              .pipe(rename({extname: '.min.js'}))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest(DEST));
});