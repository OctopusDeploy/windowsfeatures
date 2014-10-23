var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
plugins.ngAnnotate = require('gulp-ng-annotate');

var runSequence = require('run-sequence');
var browserSync = require('browser-sync');


// VARIABLES ======================================================
var isDist = plugins.util.env.type === 'dist';
var outputFolder = isDist ? 'dist' : 'build';

var globs = {
    sass: 'src/style/**/*.scss',
    templates: 'src/views/**/*.jade',
    assets: 'src/assets/**/*.*',
    app: 'src/app/**/*.ts',
    appWithDefinitions: 'src/**/*.ts',
    integration: 'src/tests/integration/**/*.js',
    data: 'src/app/data/*.json',
    index: 'src/index.jade',
    server: 'src/app.js'
};

var destinations = {
    css: "" + outputFolder + "/style",
    js: "" + outputFolder + "/src",
    libs: "" + outputFolder + "/vendor",
    assets: "" + outputFolder + "/assets",
    data: "" + outputFolder + "/public",
    index: "" + outputFolder
};

// When adding a 3rd party we want to insert in the html, add it to
// vendoredLibs, order matters
var vendoredLibs = [
    'vendor/angular.js',
    'vendor/ui-router.js',
    'bower_components/angular-resource/angular-resource.js',
    'bower_components/angular-route/angular-route.js',
    'vendor/lodash.js',
    'bower_components/jquery/dist/jquery.js',
    'bower_components/jstree/dist/jstree.js',
    'vendor/jsTree.directive.js'
];

var vendoredStyles = [
    'bower_components/jstree/dist/themes/default/*.gif',
    'bower_components/jstree/dist/themes/default/*.png',
    'bower_components/jstree/dist/themes/default/style.css'
];

var injectLibsPaths = [];

vendoredLibs.forEach(function(lib) {
    var libParts = lib.split('/');
    injectLibsPaths.push(destinations.libs + '/' + libParts[libParts.length - 1]);
});

var injectPaths = injectLibsPaths.concat([
    destinations.js +"/app/**/module.js",
    isDist? destinations.js + '/app.js' : destinations.js + "/app/**/*.js",
    destinations.js + "/templates.js",
    destinations.css + "/*.css"
]);

var karma = require('gulp-karma')({
    configFile: 'karma.conf.js'
});

var gitshasuffix = require('gulp-gitshasuffix');

// TASKS ===========================================================

gulp.task('sass', function () {
    return gulp.src(globs.sass)
        .pipe(plugins.sass({style: 'compressed', errLogToConsole: true}))
        .pipe(plugins.autoprefixer())  // defauls to > 1%, last 2 versions, Firefox ESR, Opera 12.1
        .pipe(gitshasuffix())
        .pipe(gulp.dest(destinations.css));
});

gulp.task('ts-lint', function () {
    return gulp.src(globs.app)
        .pipe(plugins.tslint())
        .pipe(plugins.tslint.report('prose', {emitError: true}));
});

var tsProject = plugins.typescript.createProject({
    declarationFiles: true,
    noExternalResolve: true
});

gulp.task('ts-compile', function () {
    var tsResult = gulp.src(globs.appWithDefinitions)
        .pipe(plugins.typescript(tsProject));

    return tsResult.js.pipe(isDist ? plugins.concat('app.js') : plugins.util.noop())
        .pipe(plugins.ngAnnotate())
        .pipe(isDist ? plugins.uglify() : plugins.util.noop())
        .pipe(plugins.wrap({ src: './iife.txt'}))
        .pipe(gitshasuffix())
        .pipe(gulp.dest(destinations.js));
});

gulp.task('templates', function () {
  return gulp.src(globs.templates)
    .pipe(plugins.jade({}))
    .pipe(plugins.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(plugins.ngHtml2js({moduleName: 'templates'}))
    .pipe(plugins.concat('templates.js'))
    .pipe(isDist ? plugins.uglify() : plugins.util.noop())
    .pipe(gulp.dest(destinations.js));
});

gulp.task('clean', function () {
    return gulp.src(['dist/', 'build/'], {read: false})
        .pipe(plugins.rimraf());
});

gulp.task('karma-once', function () {
    return karma.once();
});

gulp.task('karma-watch', function () {
    return karma.start({autoWatch: true});
});

gulp.task('webdriver_update', plugins.protractor.webdriver_update);

gulp.task('protractor', ['webdriver_update'], function () {
    return gulp.src(globs.integration)
        .pipe(plugins.protractor.protractor({configFile: 'protractor.conf.js'}));
});

gulp.task('browser-sync', function () {
  return browserSync.init(null, {
    open: false,
    server: {
      baseDir: "./build"
    },
    watchOptions: {
      debounceDelay: 1000
    }
  });
});

gulp.task('copy-vendor', ['copy-vendor-styles'], function () {
    return gulp.src(vendoredLibs)
        .pipe(isDist ? plugins.uglify() : plugins.util.noop())
        .pipe(gulp.dest(destinations.libs));
});

gulp.task('copy-vendor-styles', function() {
    return gulp.src(vendoredStyles)
      .pipe(isDist ? plugins.uglify() : plugins.util.noop())
      .pipe(gulp.dest(destinations.css));
});

gulp.task('copy-assets', function () {
    return gulp.src(globs.assets)
        .pipe(gulp.dest(destinations.assets));
});

gulp.task('copy-data', function() {
    return gulp.src(globs.data)
      .pipe(gulp.dest(destinations.data));
});

gulp.task('index', function () {
    var target = gulp.src(globs.index);
    return target
      .pipe(plugins.jade())
      .pipe(
        plugins.inject(gulp.src(injectPaths, {read: false}), {
            ignorePath: outputFolder,
            addRootSlash: false
        })
    ).pipe(gulp.dest(destinations.index));
});

gulp.task('server', function () {
  return gulp.src(globs.server)
    .pipe(gulp.dest(destinations.index));
});

gulp.task('watch', ['build', 'browser-sync'], function () {
    gulp.watch(globs.sass, ['sass']);
    gulp.watch(globs.appWithDefinitions, ['ts-lint', 'ts-compile']);
    gulp.watch(globs.templates, ['templates']);
    gulp.watch(globs.index, ['index']);
    gulp.watch(globs.assets, ['copy-assets']);
    gulp.watch(globs.data, ['copy-data']);
    gulp.watch("bower_components/**/*.js", ['copy-vendor']);

    gulp.watch('build/**/*', function(file) {
      if (file.type === "changed") {
        return browserSync.reload(file.path);
      }
    });
});

gulp.task('build', function () {
    return runSequence(
        'clean',
        ['sass', 'copy-assets', 'copy-data', 'ts-compile', 'templates', 'copy-vendor'],
        'index',
        'server'
    );
});

gulp.task('default', ['build'], function () {
    return runSequence(['watch', 'karma-watch']);
});
