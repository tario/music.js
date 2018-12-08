const gulp = require("gulp");
const rename = require('gulp-rename');
const concat = require('gulp-concat')
const uglify = require('gulp-uglify');
const connect = require('gulp-connect');
const sourcemaps = require('gulp-sourcemaps');
const addsrc = require('gulp-add-src');
const merge = require('merge-stream');
const modifyFile = require('gulp-modify-file');

const babel = require('gulp-babel');
//const babelOptions = {presets: ['@babel/env']};

const DEST = "dist/"

gulp.task("build", ["build-lib", "build-site"]);
gulp.task("build-dev", ["copy-babel-polyfill", "build-lib-deps-dev", "build-lib-dev", "build-site-deps-dev", "build-site-dev"]);
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

gulp.task('copy-babel-polyfill', function(cb) {
  const babelRuntime = gulp.src(["node_modules/babel-polyfill/dist/polyfill.min.js"]);
  return babelRuntime.pipe(gulp.dest(DEST))
});

gulp.task('build-lib-deps-dev', function(cb) {
  return gulp.src(["src/lib/*.js", "src/lib/recorder/WebAudioRecorder.min.js"])
            .pipe(concat("music-deps.js"))
            .pipe(gulp.dest(DEST));
});

gulp.task('build-lib-dev', function(cb) {
  return gulp.src(["src/typecast.js", "src/music.js", "src/music/**/*.js", "src/formats/**/*.js"])
            .pipe(sourcemaps.init().on('error', console.log))  
              .pipe(babel({presets: ['@babel/env']}).on('error', console.log))
              .pipe(modifyFile(content => content.replace('"use strict"', "")))
              .pipe(concat("music.js"))
            .pipe(sourcemaps.write(".", {sourceRoot: 'src'}))
            .pipe(gulp.dest(DEST))
            .pipe(connect.reload());
});

gulp.task('build-site-deps-dev', function(cb) {
  return gulp.src(["site/lib/*.js", "site/lib/*/*.js", "site/lib/codemirror/**/*.js"])
    .pipe(concat("site-deps.js"))
    .pipe(gulp.dest(DEST));
});

gulp.task('build-site-dev', function(cb) {
  return gulp.src([
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
              .pipe(babel({presets: ['@babel/env']}).on('error', console.log))
              .pipe(modifyFile(content => content.replace('"use strict"', "")))
              .pipe(concat("site.js"))
            .pipe(sourcemaps.write(".", {sourceRoot: 'site'}))
            .pipe(gulp.dest(DEST))
            .pipe(connect.reload());
});

gulp.task('build-lib', function(cb) {
  return gulp.src(["src/typecast.js", "src/music.js", "src/music/**/*.js", "src/formats/**/*.js"])
            .pipe(sourcemaps.init())
              .pipe(babel(babelOptions).on('error', console.log))
              .pipe(modifyFile(content => content.replace('"use strict"', "")))
              .pipe(addsrc.append(["src/lib/*.js", "src/lib/recorder/WebAudioRecorder.min.js"]))
              .pipe(concat("music.js"))
              .pipe(gulp.dest(DEST))
              .pipe(uglify())
              .pipe(rename({extname: '.min.js'}))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest(DEST));
});

gulp.task('build-site', function(cb) {
  return gulp.src([
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
            .pipe(sourcemaps.init())
              .pipe(babel(babelOptions).on('error', console.log))
              .pipe(modifyFile(content => content.replace('"use strict"', "")))
              .pipe(addsrc.prepend(["site/lib/*.js", "site/lib/*/*.js", "site/lib/codemirror/**/*.js"]))
              .pipe(concat("site.js"))
              .pipe(gulp.dest(DEST))
              .pipe(uglify())
              .pipe(rename({extname: '.min.js'}))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest(DEST));
});