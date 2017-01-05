var logger = require('./../logger');
var moment = require('moment');
var mongoose = require('./mongoose.js').mongoose();
var EventEmitter = require('events');
class BudgetEmitterProto extends EventEmitter {}

var db = mongoose.getConnection();

var BudgetEmitter = function() {
	var emitter = new BudgetEmitterProto();

	db.on('error', function() {
		logger.info('budget connection failed');
	});

	db.once('open', function() {
		logger.info('budget connection opened');

		var Schema = mongoose.getSchema();
		var budgetSchema = new Schema({
			id: {
				type: Number,
				unique: true
			},
			from: Date,
		  to: Date,
		  year: Number,
			month: String,
			days: Number,
			businessdays: String,
			amount: Number,
			projectId: Number
		});
		//budgetSchema.set('toObject', { getters: true });
		budgetSchema.plugin(mongoose.autoIncrement, {inc_field: 'id'});
		var model = mongoose.obj.model('Budget', budgetSchema);

		var res = {
			obj: model
		}; // end res

		emitter.emit('once', res);

	}); // end once

	return emitter;

};

module.exports.BudgetEmitter = BudgetEmitter;
