var logger = require('./../logger');
var moment = require('moment');
var mongoose = require('./mongoose.js').mongoose();
var EventEmitter = require('events');
class ProjectEmitterProto extends EventEmitter {}

var db = mongoose.getConnection();

var ProjectEmitter = function() {
	var emitter = new ProjectEmitterProto();

	db.on('error', function() {
		logger.info('budget connection failed');
	});

	db.once('open', function() {
		logger.info('budget connection opened');
		logger.info('ProjectEmitter keys: ' +
			JSON.stringify(Object.keys(ProjectEmitter), null, '\t'));

		var Schema = mongoose.getSchema();
		var projectSchema = new Schema({
			id: {
				type: Number,
				unique: true
			},
			from: Date,
		  to: Date,
		  name: String,
			code: String,
			daystot: Number,
			budgettot: Number,
			customerId: Number
		});
		var model = mongoose.obj.model('Project', projectSchema);

		var res = {
			obj: model,
			findOne: function(conditions, cb) {
				var res = {};

				logger.info('Project Model keys: ' +
					JSON.stringify(Object.keys(Project), null, '\t'));

				Project.findOne(conditions, function (err, project) {
				  if (err) {
						res.error = err;
						cb(err, res);
					}
				  logger.info('find one project',
						JSON.stringify(project, null, '\t'));
					res.project = project;
					cb(err, res);
				});
			}
		}; // end res

		emitter.emit('once', res);

	}); // end once

	return emitter;
};

module.exports.ProjectEmitter = ProjectEmitter;
