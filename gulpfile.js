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
	gulp.src(['/home/federico/Documents/ehour/projects/hereweare/server/lib/mongo-pool.js'])
    .pipe(replace('$mongodbport$', '27018'))
    .pipe(gulp.dest('/home/federico/Documents/ehour/projects/hereweare/build/local/server/lib'));

	gutil.log('modify connMongoDb file in local...');
	gulp.src(['/home/federico/Documents/ehour/projects/hereweare/server/middleware/local/connMongoDb.js'])
    .pipe(replace('$mongodbport$', '27018'))
    .pipe(gulp.dest('/home/federico/Documents/ehour/projects/hereweare/build/local/server/middleware/local'));

	gutil.log('modify datasources.json file in local...');
	gulp.src(['/home/federico/Documents/ehour/projects/hereweare/server/datasources.json'])
    .pipe(replace('$mongodbport$', '27018'))
    .pipe(gulp.dest('/home/federico/Documents/ehour/projects/hereweare/build/local/server'));
}

// Modify test
function modifyTestFn() {
	gutil.log('modify mongo-pool.js file in local...');
	gulp.src(['/home/federico/Documents/ehour/projects/hereweare/server/lib/mongo-pool.js'])
    .pipe(replace('$mongodbport$', '27017'))
    .pipe(gulp.dest('/home/federico/Documents/ehour/projects/hereweare/build/test/server/lib'));

	gutil.log('modify connMongoDb file in local...');
	gulp.src(['/home/federico/Documents/ehour/projects/hereweare/server/middleware/local/connMongoDb.js'])
    .pipe(replace('$mongodbport$', '27017'))
    .pipe(gulp.dest('/home/federico/Documents/ehour/projects/hereweare/build/test/server/middleware/local'));

	gutil.log('modify datasources.json file in local...');
	gulp.src(['/home/federico/Documents/ehour/projects/hereweare/server/datasources.json'])
    .pipe(replace('$mongodbport$', '27017'))
    .pipe(gulp.dest('/home/federico/Documents/ehour/projects/hereweare/build/test/server'));
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

// Default task: Check configuration
gulp.task('default', function() {
	gutil.log('checking configuration...');
	gutil.log('config: ' + JSON.stringify(config, null, '\t'));
});
