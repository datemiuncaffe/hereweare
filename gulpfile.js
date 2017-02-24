var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require("gulp-rename");
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var del = require('del');
var changed = require('gulp-changed');
var shipitCaptain = require('shipit-captain');
var sonar = require("gulp-sonar");

var config = require('./gulpconfig.json');

var sonarCssLocalConfig = require('./config/sonar/css/sonar-local-css.json');
var sonarCssTestConfig = require('./config/sonar/css/sonar-test-css.json');
var sonarHtmlLocalConfig = require('./config/sonar/html/sonar-local-html.json');
var sonarHtmlTestConfig = require('./config/sonar/html/sonar-test-html.json');
var sonarJsLocalConfig = require('./config/sonar/js/sonar-local-js.json');
var sonarJsTestConfig = require('./config/sonar/js/sonar-test-js.json');

var shipitConfig = require('./config/shipit').config;
var shipitConfigForDelivery = require('./config/shipit-delivery').config;

// Default task: Check configuration
gulp.task('default', function() {
	gutil.log('checking configuration...');
	gutil.log('config: ' + JSON.stringify(config, null, '\t'));
});

/* -------------------- custom functions and tasks -------------------------- */

// Clean build folder function:
function cleanBuildFn() {
	gutil.log('cleaning build folder...');
    return del.sync([config.local.dest, config.test.dest]);
}

// Build local
function buildLocalFn() {
	gutil.log('build:local ...');
	return gulp.src(config.local.src)
		.pipe(changed(config.local.dest))
    .pipe(gulp.dest(config.local.dest));
}
function buildCompleteLocalFn() {
	return gulp.src(config.local.srcall)
    .pipe(gulp.dest(config.local.dest));
}

// Build test
function buildTestFn() {
	gutil.log('build test ...');
	gutil.log(`Current directory: ${process.cwd()}`);
	return gulp.src(config.test.src)
		.pipe(changed(config.test.dest))
    .pipe(gulp.dest(config.test.dest));

	// src = [
	// 	"**",
	// 	"**/.*",
	// 	"**/.*/**",
	// 	"**/.*/**/.*",
	// 	"!**/vendor",
	// 	"!**/node_modules",
	// 	"!**/build",
	// 	"!**/vendor/**",
	// 	"!**/node_modules/**",
	// 	"!**/build/**",
	// 	"!**/vendor/**/.*",
	// 	"!**/node_modules/**/.*",
	// 	"!**/build/**/.*",
	// 	"!**/vendor/**/.*/**",
	// 	"!**/node_modules/**/.*/**",
	// 	"!**/build/**/.*/**",
	// 	"!**/vendor/**/.*/**/.*",
	// 	"!**/node_modules/**/.*/**/.*",
	// 	"!**/build/**/.*/**/.*"
	// ];
}
function buildCompleteTestFn() {
	return gulp.src(config.test.srcall)
    .pipe(gulp.dest(config.test.dest));
}

// Modify local
function modifyLocalFn() {
	gutil.log('modify app.js file in local...');
	gulp.src([config.local.modify[0].src])
    .pipe(replace('$resourceBaseUrl$', 'localhost:3002'))
    .pipe(gulp.dest(config.local.modify[0].dest));

	gutil.log('modify ricerca.html file in local...');
	gulp.src([config.local.modify[1].src])
    .pipe(replace('$resourceBaseUrl$', 'localhost:3002'))
    .pipe(gulp.dest(config.local.modify[1].dest));
}

// Modify test
function modifyTestFn() {
	gutil.log('modify app.js file in test...');
	gulp.src([config.test.modify[0].src])
    .pipe(replace('$resourceBaseUrl$', '89.96.126.46:3002'))
    .pipe(gulp.dest(config.test.modify[0].dest));

	gutil.log('modify ricerca.html file in test...');
	gulp.src([config.test.modify[1].src])
    .pipe(replace('$resourceBaseUrl$', '89.96.126.46:3002'))
    .pipe(gulp.dest(config.test.modify[1].dest));
}

/* ---------------- sonar analysis functions ------------------------ */
function sonarCssLocalAnalysisFn() {
	gutil.log('local css code analysis ...');
	return gulp.src('thisFileDoesNotExist.js', { read: false })
		  .pipe(sonar(sonarCssLocalConfig));
}

function sonarCssTestAnalysisFn() {
	gutil.log('test css code analysis ...');
	return gulp.src('thisFileDoesNotExist.js', { read: false })
		  .pipe(sonar(sonarCssTestConfig));
}

function sonarHtmlLocalAnalysisFn() {
	gutil.log('local html code analysis ...');
	return gulp.src('thisFileDoesNotExist.js', { read: false })
		  .pipe(sonar(sonarHtmlLocalConfig));
}

function sonarHtmlTestAnalysisFn() {
	gutil.log('test html code analysis ...');
	return gulp.src('thisFileDoesNotExist.js', { read: false })
		  .pipe(sonar(sonarHtmlTestConfig));
}

function sonarJsLocalAnalysisFn() {
	gutil.log('local js code analysis ...');
	return gulp.src('thisFileDoesNotExist.js', { read: false })
		  .pipe(sonar(sonarJsLocalConfig));
}

function sonarJsTestAnalysisFn() {
	gutil.log('test js code analysis ...');
	return gulp.src('thisFileDoesNotExist.js', { read: false })
		  .pipe(sonar(sonarJsTestConfig));
}
/* ---------------- end sonar analysis functions --------------------- */

/* --------------------------------------------------------------------- */
/* ------------------------------ tasks -------------------------------- */
/* --------------------------------------------------------------------- */

gulp.task('build:deploy', function() {
	runSequence(['build:local', 'build:test'],
							['modify:local', 'modify:test'],
							'deploy');
});

gulp.task('buildcomplete', function() {
	runSequence(['buildcomplete:local', 'buildcomplete:test'],
							['modify:local', 'modify:test']);
});

gulp.task('build', function() {
	// gulp.watch(config.test.src, ['build']);

	// gulp.watch(config.test.src, function(event) {
   // 	console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	// });

	runSequence(['build:local', 'build:test'],
					['modify:local', 'modify:test']);
});

// Clean tasks:
gulp.task('clean', cleanBuildFn);

// Build tasks:
gulp.task('build:local', buildLocalFn);
gulp.task('build:test', buildTestFn);
gulp.task('buildcomplete:local', buildCompleteLocalFn);
gulp.task('buildcomplete:test', buildCompleteTestFn);

// Modify tasks:
gulp.task('modify:local', modifyLocalFn);
gulp.task('modify:test', modifyTestFn);

// Sonar task
gulp.task('sonar:local:css', sonarCssLocalAnalysisFn);
gulp.task('sonar:test:css', sonarCssTestAnalysisFn);
gulp.task('sonar:local:html', sonarHtmlLocalAnalysisFn);
gulp.task('sonar:test:html', sonarHtmlTestAnalysisFn);
gulp.task('sonar:local:js', sonarJsLocalAnalysisFn);
gulp.task('sonar:test:js', sonarJsTestAnalysisFn);

// Deploy task
var options = {
  init: require('./config/shipit').init,
  run: ['deploy'],
  targetEnv: 'staging'
}
gulp.task('deploy', function(cb) {
  shipitCaptain(shipitConfig, options, cb);
});

/* ----------------------------- jenkins tasks ------------------------------ */

/* --------- delivery deploy ---------- */
var deliveryOptions = {
  init: require('./config/shipit-delivery').init,
  //run: ['pwd', 'list'],
	run: ['deploy:init', 'deploy:update', 'deploy:publish',
				'deploy:clean', 'deploy:finish',
				'npm:install', 'bower:install'],
  targetEnv: 'staging',
	confirm: false
}
gulp.task('deploy-no-fetch', function(cb) {
	try {
    shipitCaptain(shipitConfigForDelivery, deliveryOptions, cb);
	} catch(err) {
	  gutil.log('deploy-no-fetch err: ' + err);
	}
	gutil.log('deploy-no-fetch...');
});
gulp.task('delivery-pipeline', function(cb) {
	runSequence(['clean', 'build', 'deploy-no-fetch']);
});
/* --------- end  delivery deploy ---------- */

/* --------- sonar ------------------------- */
//gulp.task('sonar-pipeline:css', ['build:local', 'build:test', 'modify:local', 'modify:test'], sonarCssTestAnalysisFn);

gulp.task('sonar-pipeline:css', ['build:test'], sonarCssTestAnalysisFn);
gulp.task('sonar-pipeline:html', ['sonar-pipeline:css'], sonarHtmlTestAnalysisFn);
gulp.task('sonar-pipeline:js', ['sonar-pipeline:html'], sonarJsTestAnalysisFn);

gulp.task('sonar-pipeline', ['sonar-pipeline:js'], function() {
	gutil.log('end of sonar-pipeline ...');
	//runSequence(['build', 'sonar:test:css', 'sonar:test:html', 'sonar:test:js']);
});
/* --------- end  sonar -------------------- */
/* ------------------------ end jenkins tasks ------------------------------ */
