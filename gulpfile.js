var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require("gulp-rename");
var replace = require('gulp-replace');
var changed = require('gulp-changed');
var gulpSequence = require('gulp-sequence');
var del = require('del');

var shipitCaptain = require('shipit-captain');
var sonar = require("gulp-sonar");

var config = require('./gulpconfig.json');

var sonarCssLocalConfig = require('./config/sonar/css/sonar-local-css.json');
var sonarCssTestConfig = require('./config/sonar/css/sonar-test-css.json');
var sonarHtmlLocalConfig = require('./config/sonar/html/sonar-local-html.json');
var sonarHtmlTestConfig = require('./config/sonar/html/sonar-test-html.json');
var sonarJsLocalConfig = require('./config/sonar/js/sonar-local-js.json');
var sonarJsTestConfig = require('./config/sonar/js/sonar-test-js.json');

var shipitLocal = require('./config/shipit-local');
var shipitForDelivery = require('./config/shipit-delivery');

/* -------------------- custom functions and tasks -------------------------- */

// Clean build folder function:
function cleanLocalFn() {
	gutil.log('cleaning build/local folder...');
	return del([config.local.dest]);
}
function cleanTestFn() {
	gutil.log('cleaning build/test folder...');
	return del([config.test.dest]);
}

// Copy local
function copyLocalFn() {
	gutil.log('copy:local ...');
	return gulp.src(config.local.src)
		.pipe(changed(config.local.dest))
    	.pipe(gulp.dest(config.local.dest));
}
function copyCompleteLocalFn() {
	gutil.log('copycomplete:local ...');
	return gulp.src(config.local.srcall)
		.pipe(changed(config.local.dest))
   	.pipe(gulp.dest(config.local.dest));
}

// Copy test
function copyTestFn() {
	gutil.log('copy test ...');
	gutil.log(`Current directory: ${process.cwd()}`);
	return gulp.src(config.test.src)
		.pipe(changed(config.test.dest))
   	.pipe(gulp.dest(config.test.dest));
}
function copyCompleteTestFn() {
	gutil.log('copycomplete test ...');
	return gulp.src(config.test.srcall)
		.pipe(changed(config.test.dest))
   	.pipe(gulp.dest(config.test.dest));
}

// Modify local
function modifyLocalFn() {
	gutil.log('modify app.js file in local...');
	gulp.src([config.local.modify[0].src])
    //.pipe(replace('$resourceBaseUrlBackend$', 'localhost:3002'))
	 .pipe(replace('$resourceBaseUrlBackend$', 'hereweare/hereweareapp/hereweare-backend'))
	 .pipe(replace('$resourceBaseUrlOperations$', 'hereweare/hereweareapp/hereweare-operations'))
    .pipe(gulp.dest(config.local.modify[0].dest));

	gutil.log('modify ricerca.html file in local...');
	gulp.src([config.local.modify[1].src])
    //.pipe(replace('$resourceBaseUrlBackend$', 'localhost:3002'))
	 .pipe(replace('$resourceBaseUrlBackend$', 'hereweare/hereweareapp/hereweare-backend'))
	 .pipe(replace('$resourceBaseUrlOperations$', 'hereweare/hereweareapp/hereweare-operations'))
    .pipe(gulp.dest(config.local.modify[1].dest));
}

// Modify test
function modifyTestFn() {
	gutil.log('modify app.js file in test...');
	gulp.src([config.test.modify[0].src])
    //.pipe(replace('$resourceBaseUrlBackend$', '89.96.126.46:3002'))
	 //.pipe(replace('$resourceBaseUrlBackend$', '192.168.88.184:3002'))
	 //.pipe(replace('$resourceBaseUrlBackend$', 'localhost:3002'))
	 //.pipe(replace('$resourceBaseUrlBackend$', '89.96.126.46/hereweare/hereweare-backend'))
	 .pipe(replace('$resourceBaseUrlBackend$', '89.96.126.46/hereweareapp/hereweare-backend'))
	 .pipe(replace('$resourceBaseUrlOperations$', '89.96.126.46/hereweareapp/hereweare-operations'))
    .pipe(gulp.dest(config.test.modify[0].dest));

	gutil.log('modify ricerca.html file in test...');
	gulp.src([config.test.modify[1].src])
    //.pipe(replace('$resourceBaseUrlBackend$', '89.96.126.46:3002'))
	 //.pipe(replace('$resourceBaseUrlBackend$', '192.168.88.184:3002'))
	 //.pipe(replace('$resourceBaseUrlBackend$', 'localhost:3002'))
	 //.pipe(replace('$resourceBaseUrlBackend$', '89.96.126.46/hereweare/hereweare-backend'))
	 .pipe(replace('$resourceBaseUrlBackend$', '89.96.126.46/hereweareapp/hereweare-backend'))
	 .pipe(replace('$resourceBaseUrlOperations$', '89.96.126.46/hereweareapp/hereweare-operations'))
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

// ------------- Default task: Check configuration --------------
gulp.task('default', function() {
	gutil.log('checking configuration...');
	gutil.log('config: ' + JSON.stringify(config, null, '\t'));
});

// ------------- Clean tasks: ---------------------------
gulp.task('clean:local', cleanLocalFn);
gulp.task('clean:test', cleanTestFn);

function cleanFn(cb) {
	gutil.log('clean local and test in series ...');
	gulpSequence('clean:local', 'clean:test', cb);
}
gulp.task('clean', cleanFn);

// --------------------- Copy tasks: --------------------------
gulp.task('copy:local', copyLocalFn);
gulp.task('copy:test', copyTestFn);
gulp.task('copycomplete:local', copyCompleteLocalFn);
gulp.task('copycomplete:test', copyCompleteTestFn);

function copyFn(cb) {
	gutil.log('copy local and test in series ...');
	gulpSequence('copy:local', 'copy:test', cb);
}
function copyCompleteFn(cb) {
	gutil.log('copycomplete local and test in series ...');
	gulpSequence('copycomplete:local', 'copycomplete:test', cb);
}

gulp.task('copy', copyFn);
gulp.task('copycomplete', copyCompleteFn);

// --------------------- Modify tasks: ------------------------------
gulp.task('modify:local', modifyLocalFn);
gulp.task('modify:test', modifyTestFn);

function modifyFn(cb) {
	gutil.log('modify (modify:local and modify:test in series) ...');
	gulpSequence('modify:local', 'modify:test', cb);
}
gulp.task('modify', modifyFn);

// --------------------- Build tasks -------------------------
function buildLocalFn(cb) {
	gutil.log('build:local (running in series) ...');
	gulpSequence('clean:local', 'copy:local', 'modify:local', cb);
}
function buildCompleteLocalFn(cb) {
	gutil.log('buildcomplete:local (running in series) ...');
	gulpSequence('clean:local', 'copycomplete:local', 'modify:local', cb);
}
function buildTestFn(cb) {
	gutil.log('build:test (running in series) ...');
	gulpSequence('clean:test', 'copy:test', 'modify:test', cb);
}
function buildCompleteTestFn(cb) {
	gutil.log('buildcomplete:test (running in series) ...');
	gulpSequence('clean:test', 'copycomplete:test', 'modify:test', cb);
}
function buildFn(cb) {
	gutil.log('build (running in series) ...');
	gulpSequence('build:local', 'build:test', cb);
}
function buildCompleteFn(cb) {
	gutil.log('buildcomplete (running in series) ...');
	gulpSequence('buildcomplete:local', 'buildcomplete:test', cb);
}
gulp.task('build:local', buildLocalFn);
gulp.task('buildcomplete:local', buildCompleteLocalFn);
gulp.task('build:test', buildTestFn);
gulp.task('buildcomplete:test', buildCompleteTestFn);
gulp.task('build', buildFn);
gulp.task('buildcomplete', buildCompleteFn);

// ---------------------- Deploy task ----------------------------
var shipitLocalOptions = {
	init: shipitLocal.init,
	run: ['deploy:init', 'deploy:update', 'deploy:publish',
			'deploy:clean', 'deploy:finish',
			'npm:install', 'bower:install'],
	targetEnv: 'staging',
	confirm: true
}
gulp.task('deploy-no-fetch:local', function(cb) {
	try {
   	shipitCaptain(shipitLocal.config, shipitLocalOptions, cb);
	} catch(err) {
		gutil.log('deploy-no-fetch:local err: ' + err);
	}
	gutil.log('deploy-no-fetch:local ...');
});
gulp.task('build:deploy', function(cb) {
	gutil.log('build and deploy-no-fetch:local (running in series) ...');
	gulpSequence('buildcomplete:test', 'deploy-no-fetch:local', cb);
});

// ------------------ Sonar task -------------------------------
gulp.task('sonar:local:css', sonarCssLocalAnalysisFn);
gulp.task('sonar:test:css', sonarCssTestAnalysisFn);
gulp.task('sonar:local:html', sonarHtmlLocalAnalysisFn);
gulp.task('sonar:test:html', sonarHtmlTestAnalysisFn);
gulp.task('sonar:local:js', sonarJsLocalAnalysisFn);
gulp.task('sonar:test:js', sonarJsTestAnalysisFn);

/* ----------------------------- jenkins tasks ------------------------------ */

/* --------- delivery deploy ---------- */
var shipitDeliveryOptions = {
	init: shipitForDelivery.init,
	run: ['deploy:init', 'deploy:update', 'deploy:publish',
			'deploy:clean', 'deploy:finish',
			'npm:install', 'bower:install'],
	targetEnv: 'staging',
	confirm: false
}
gulp.task('deploy-no-fetch', function(cb) {
	try {
    shipitCaptain(shipitForDelivery.config, shipitDeliveryOptions, cb);
	} catch(err) {
	  gutil.log('deploy-no-fetch err: ' + err);
	}
	gutil.log('deploy-no-fetch...');
});
gulp.task('delivery-pipeline', function(cb) {
	gutil.log('delivery-pipeline (running in series) ...');
	gulpSequence('build:test', 'deploy-no-fetch', cb);
});
/* --------- end  delivery deploy ---------- */

/* --------- sonar ------------------------- */
function sonarPipelineLocalCssFn(cb) {
	gutil.log('sonar-pipeline:local:css (running in series) ...');
	gulpSequence('build:local', 'sonar:local:css', cb);
}
function sonarPipelineTestCssFn(cb) {
	gutil.log('sonar-pipeline:test:css (running in series) ...');
	gulpSequence('build:test', 'sonar:test:css', cb);
}
function sonarPipelineLocalHtmlFn(cb) {
	gutil.log('sonar-pipeline:local:html (running in series) ...');
	gulpSequence('build:local', 'sonar:local:html', cb);
}
function sonarPipelineTestHtmlFn(cb) {
	gutil.log('sonar-pipeline:test:html (running in series) ...');
	gulpSequence('build:test', 'sonar:test:html', cb);
}
function sonarPipelineLocalJsFn(cb) {
	gutil.log('sonar-pipeline:local:js (running in series) ...');
	gulpSequence('build:local', 'sonar:local:js', cb);
}
function sonarPipelineTestJsFn(cb) {
	gutil.log('sonar-pipeline:test:js (running in series) ...');
	gulpSequence('build:test', 'sonar:test:js', cb);
}
gulp.task('sonar-pipeline:local:css', sonarPipelineLocalCssFn);
gulp.task('sonar-pipeline:test:css', sonarPipelineTestCssFn);
gulp.task('sonar-pipeline:local:html', sonarPipelineLocalHtmlFn);
gulp.task('sonar-pipeline:test:html', sonarPipelineTestHtmlFn);
gulp.task('sonar-pipeline:local:js', sonarPipelineLocalJsFn);
gulp.task('sonar-pipeline:test:js', sonarPipelineTestJsFn);

function sonarPipelineTestFn(cb) {
	gutil.log('sonar-pipeline:test (running in series) ...');
	gulpSequence('build:test',
		'sonar:test:css', 'sonar:test:html', 'sonar:test:js', cb);
}
gulp.task('sonar-pipeline:test', sonarPipelineTestFn);

/* --------- end  sonar -------------------- */
/* ------------------------ end jenkins tasks ------------------------------ */
