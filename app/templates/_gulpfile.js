var gulp = require('gulp');
var connect = require('gulp-connect');
var wiredep = require('wiredep').stream;
var $ = require('gulp-load-plugins')();
var del = require('del');
var jsReporter = require('jshint-stylish');
var pkg = require('./package.json');

var templateOptions = {
  root: '{widgetsPath}/<%= widgetName %>/src',
  module: 'adf.widget.<%= widgetName %>'
};

/** lint **/

gulp.task('csslint', function(){
  gulp.src('src/*.css')
      .pipe($.csslint())
      .pipe($.csslint.reporter());
});

gulp.task('jslint', function(){
  gulp.src('src/*.js')
      .pipe($.jshint())
      .pipe($.jshint.reporter(jsReporter));
});

gulp.task('lint', ['csslint', 'jslint']);

/** serve **/

gulp.task('templates', function(){
  return gulp.src('src/*.html')
             .pipe($.angularTemplatecache('templates.tpl.js', templateOptions))
             .pipe(gulp.dest('.tmp/dist'));
});

gulp.task('sample', ['templates'], function(){
  var files = gulp.src(['src/*.js', 'src/*.css', '.tmp/dist/*.js'], {read: false});
  gulp.src('sample/index.html')
      .pipe(wiredep({
        directory: './components/',
        bowerJson: require('./bower.json'),
        devDependencies: true,
        dependencies: true
      }))
      .pipe($.inject(files))
      .pipe(gulp.dest('.tmp/dist'))
      .pipe(connect.reload());
});

gulp.task('watch', function(){
  gulp.watch(['src/*'], ['sample']);
});

gulp.task('serve', ['watch', 'sample'], function(){
  connect.server({
    root: ['.tmp/dist', '.'],
    livereload: true,
    port: 9001
  });
});

/** build **/

gulp.task('css', function(){
  gulp.src('src/*.css')
      .pipe($.concat(pkg.name + '.min.css'))
      .pipe($.minifyCss())
      .pipe(gulp.dest('dist/'));
});

gulp.task('js', function() {
  gulp.src(['src/*.js', 'src/*.html'])
      .pipe($.if('*.html', $.minifyHtml()))
      .pipe($.if('*.html', $.angularTemplatecache(pkg.name + '.tpl.js', templateOptions)))
      .pipe($.ngAnnotate())
      .pipe($.concat(pkg.name + '.min.js'))
      // https://github.com/olov/ng-annotate/issues/133
      //.pipe($.uglify())
      .pipe(gulp.dest('dist/'));
});

/** clean **/

gulp.task('clean', function(cb){
  del(['dist', '.tmp'], cb);
});

gulp.task('default', ['css', 'js']);