var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require("gulp-rename");
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var del = require('del');
var changed = require('gulp-changed');

var shipitCaptain = require('shipit-captain');
var config = require('./gulpconfig.json');
var shipitConfig = require('./config/shipit').config;
var shipitConfigForDelivery = require('./config/shipit-delivery').config;

// Clean build folder function:
function cleanBuildFn() {
	gutil.log('cleaning build folder...');
    return del.sync([config.local.dest, config.test.dest]);
}

// Build local
function buildLocalFn() {
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
	return gulp.src(config.test.src)
		.pipe(changed(config.test.dest))
    .pipe(gulp.dest(config.test.dest));
}
function buildCompleteTestFn() {
	return gulp.src(config.test.srcall)
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

// Deploy task
var options = {
  init: require('./config/shipit').init,
  run: ['deploy'],
  targetEnv: 'staging',
}
gulp.task('deploy', function(cb) {
  shipitCaptain(shipitConfig, options, cb);
});

// deploy from jenkins
var deliveryOptions = {
  init: require('./config/shipit-delivery').init,
  //run: ['pwd', 'list'],
	run: ['deploy:init', 'deploy:update', 'deploy:publish',
				'deploy:clean', 'deploy:finish', 'npm:install'],
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
	runSequence(['build', 'deploy-no-fetch']);
});

// Default task: Check configuration
gulp.task('default', function() {
	gutil.log('checking configuration...');
	gutil.log('config: ' + JSON.stringify(config, null, '\t'));
});
