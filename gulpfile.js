var gulp = require("gulp");
var rename = require('gulp-rename');
var concat = require('gulp-concat')
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var DEST = "dist/"
gulp.task("default", ["build-lib", "build-site"]);
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
  return gulp.src(["site/lib/*.js", "site/lib/*/*.js", "site/app.js", "site/*.js"])
            .pipe(sourcemaps.init())
              .pipe(concat("site.js"))
              .pipe(gulp.dest(DEST))
              .pipe(uglify())
              .pipe(rename({extname: '.min.js'}))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest(DEST));
});