const gulp = require("gulp");
const rename = require('gulp-rename');
const concat = require('gulp-concat')
const uglify = require('gulp-uglify');
const connect = require('gulp-connect');
const sourcemaps = require('gulp-sourcemaps');
const addsrc = require('gulp-add-src');
const merge = require('merge-stream');
const modifyFile = require('gulp-modify-file');
const noop = require('gulp-noop');
const filter = require('gulp-filter');
const path = require('path');

const argv = require('yargs').argv;

const babel = require('gulp-babel');
//const babelOptions = {presets: ['@babel/env']};

const DEST = "dist/"

gulp.task("build", ["copy-babel-polyfill", "build-lib", "build-site"]);
gulp.task("default", ["build", "webserver", "watch"]);

gulp.task('webserver', function() {
  connect.server({livereload: true});
});

gulp.task('watch', function() {
    gulp.watch('site/**/*.js', ['build-site']);
    gulp.watch('site/templates/*', ['build-site']);
    gulp.watch('css/*', ['build-site']);
    gulp.watch('*.html', ['build-site']);
    gulp.watch('src/**/*.js', ['build-lib']);
})

const maybeUglify = () => {
  if (argv.disableUglify) {
    return noop();
  } else {
    return uglify();
  }
};

gulp.task('copy-babel-polyfill', function(cb) {
  const babelRuntime = gulp.src(["node_modules/babel-polyfill/dist/polyfill.min.js"]);
  return babelRuntime.pipe(gulp.dest(DEST))
});

gulp.task('build-lib', function(cb) {
  const libFilter = filter(['**', '!*src/lib/**'], {restore: true});

  return gulp.src(["src/lib/*.js", "src/lib/recorder/WebAudioRecorder.min.js", 
            "src/typecast.js", "src/music.js", "src/music/**/*.js", "src/formats/**/*.js"])
            .pipe(sourcemaps.init().on('error', console.log))
              .pipe(libFilter)
              .pipe(babel({presets: ['@babel/env']}).on('error', console.log))
              .pipe(modifyFile(content => content.replace('"use strict"', "")))
              .pipe(libFilter.restore)
              .pipe(maybeUglify())
              .pipe(sourcemaps.mapSources((_path, file) => {
                return path.relative(__dirname, file.base).replace('\\','/') + '/' + _path;
              }))
              .pipe(concat("music.js"))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(DEST))
            .pipe(connect.reload());
});

gulp.task('build-site', function(cb) {
  const libFilter = filter(['**', '!*site/lib/**'], {restore: true});
  return gulp.src([
            "site/lib/*.js", "site/lib/*/*.js", "site/lib/codemirror/**/*.js",
            "site/app.js",
            "site/lang/*.js",
            "site/langSettings.js",
            "site/routes.js", 
            "site/directives.js", 
            "site/directives/*.js", 
            "site/services.js", 
            "site/services/*.js", 
            "site/controllers.js", 
            "site/controllers/*.js", 
            ])
            .pipe(sourcemaps.init().on('error', console.log))
              .pipe(libFilter)
              .pipe(babel({presets: ['@babel/env']}).on('error', console.log))
              .pipe(modifyFile(content => content.replace('"use strict"', "")))
              .pipe(libFilter.restore)
              .pipe(maybeUglify())
              .pipe(sourcemaps.mapSources((_path, file) => {
                return path.relative(__dirname, file.base).replace('\\','/') + '/' + _path;
              }))
              .pipe(concat("site.js"))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(DEST))
            .pipe(connect.reload());
});
