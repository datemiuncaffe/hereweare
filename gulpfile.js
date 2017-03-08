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

var sonarLocalConfig = require('./config/sonar/sonar-local.json');
var sonarTestConfig = require('./config/sonar/sonar-test.json');

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
	gutil.log('modify mongo-pool.js file in local...');
	gulp.src([config.local.modify[0].src])
    .pipe(replace('$mongodbport$', '27018'))
    .pipe(gulp.dest(config.local.modify[0].dest));

	gutil.log('modify connMongoDb file in local...');
	gulp.src([config.local.modify[1].src])
    .pipe(replace('$mongodbport$', '27018'))
    .pipe(gulp.dest(config.local.modify[1].dest));

	gutil.log('modify datasources.json file in local...');
	gulp.src([config.local.modify[2].src])
    .pipe(replace('$mongodbport$', '27018'))
    .pipe(gulp.dest(config.local.modify[2].dest));

	gutil.log('modify logpath in logger.js file in local...');
	gulp.src([config.local.logger.src])
    .pipe(replace('$logpath$', config.local.logger.logpath))
    .pipe(gulp.dest(config.local.logger.dest));
}

// Modify test
function modifyTestFn() {
	gutil.log('modify mongo-pool.js file in test...');
	gulp.src([config.test.modify[0].src])
    .pipe(replace('$mongodbport$', '27017'))
    .pipe(gulp.dest(config.test.modify[0].dest));

	gutil.log('modify connMongoDb file in test...');
	gulp.src([config.test.modify[1].src])
    .pipe(replace('$mongodbport$', '27017'))
    .pipe(gulp.dest(config.test.modify[1].dest));

	gutil.log('modify datasources.json file in test...');
	gulp.src([config.test.modify[2].src])
    .pipe(replace('$mongodbport$', '27017'))
    .pipe(gulp.dest(config.test.modify[2].dest));

	gutil.log('modify logpath in logger.js file in test...');
	gulp.src([config.test.logger.src])
    .pipe(replace('$logpath$', config.test.logger.logpath))
    .pipe(gulp.dest(config.test.logger.dest));
}

/* ---------------- sonar analysis functions ------------------------ */
function sonarLocalAnalysisFn() {
	gutil.log('local code analysis ...');
	return gulp.src('thisFileDoesNotExist.js', { read: false })
		  .pipe(sonar(sonarLocalConfig));
}

function sonarTestAnalysisFn() {
	gutil.log('test code analysis ...');
	return gulp.src('thisFileDoesNotExist.js', { read: false })
		  .pipe(sonar(sonarTestConfig));
}
/* ---------------- end sonar analysis functions --------------------- */

/* --------------------------------------------------------------------- */
/* ------------------------------ tasks -------------------------------- */
/* --------------------------------------------------------------------- */

// ------------- Default task: Check configuration -----------------------
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
			'deploy:clean', 'deploy:finish', 'npm:install'],
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
gulp.task('sonar:local', sonarLocalAnalysisFn);
gulp.task('sonar:test', sonarTestAnalysisFn);

/* ----------------------------- jenkins tasks ------------------------------ */

/* --------- delivery deploy ---------- */
var shipitDeliveryOptions = {
	init: shipitForDelivery.init,
	run: ['deploy:init', 'deploy:update', 'deploy:publish',
			'deploy:clean', 'deploy:finish', 'npm:install'],
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
function sonarPipelineTestFn(cb) {
	gutil.log('sonar-pipeline:test (running in series) ...');
	gulpSequence('build:test', 'sonar:test', cb);
}
gulp.task('sonar-pipeline:test', sonarPipelineTestFn);
/* --------- end  sonar -------------------- */
/* ------------------------ end jenkins tasks ------------------------------ */
