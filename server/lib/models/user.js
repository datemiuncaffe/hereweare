var logger = require('./../logger');
var mongoose = require('./mongoose.js').mongoose();
var EventEmitter = require('events');
class UserEmitterProto extends EventEmitter {}

var db = mongoose.getConnection();

var Schema = mongoose.getSchema();
var userSchema = new Schema({
	id: {
		type: Number,
		unique: true
	},
	userId: Number,
	userName: String,
	password: String,
	firstName: String,
	lastName: String,
	departmentId: Number,
	email: String,
	active: String
});

var UserEmitter = function() {
	var emitter = new UserEmitterProto();

	db.on('error', function() {
		logger.info('UserEmitter connection failed');
	});

	db.once('open', function() {
		logger.info('user connection opened');
		logger.info('UserEmitter keys: ' +
			JSON.stringify(Object.keys(UserEmitter), null, '\t'));

		var model = mongoose.obj.model('User', userSchema);

		var res = {
			obj: model
		}; // end res

		emitter.emit('once', res);

	}); // end once

	return emitter;
};

module.exports.userSchema = userSchema;
module.exports.UserEmitter = UserEmitter;
