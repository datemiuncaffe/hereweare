var Budget = function() {
	var logger = require('./../logger');
	var moment = require('moment');
	var mongoose = require('./mongoose.js').mongoose();
	var EventEmitter = require('events');
	class MyBudgetEmitter extends EventEmitter {}
	var BudgetEmitter = new MyBudgetEmitter();

	logger.info('EventEmitter keys: ' +
		JSON.stringify(Object.keys(EventEmitter), null, '\t'));

	var db = mongoose.getConnection();
	db.on('error', function() {
		logger.info('budget connection failed');
	});

	db.once('open', function() {
		logger.info('budget connection opened');
		logger.info('BudgetEmitter keys: ' +
			JSON.stringify(Object.keys(BudgetEmitter), null, '\t'));
		//logger.info('emit: ' + BudgetEmitter.emit);

		var Schema = mongoose.getSchema();
		var budgetSchema = new Schema({
			_id: Number,
			from: Date,
		  to: Date,
		  year: Number,
			month: String,
			days: Number,
			businessdays: String,
			amount: Number,
			projectId: Number
		});
		var Budget = mongoose.obj.model('Budget', budgetSchema);

		logger.info('Budget Model keys: ' +
			JSON.stringify(Object.keys(Budget), null, '\t'));
		logger.info('Check Budget Model findOne: ' +
			JSON.stringify(Budget.findOne, null, '\t'));

		var BudgetInst = new Budget();
		logger.info('BudgetInst Model keys: ' +
			JSON.stringify(Object.keys(BudgetInst), null, '\t'));
		logger.info('Check BudgetInst Model findOne: ' +
			JSON.stringify(BudgetInst.findOne, null, '\t'));

		var res = {
			obj: Budget,
			count: function(conditions, cb) {
				var res = {};
				Budget.count(conditions, function (err, count) {
				  if (err) {
						res.error = err;
						cb(err, res);
					}
				  logger.info('there are %d budgets', count);
					res.count = count;
					cb(err, res);
				});
			},
			findOne: function(conditions, cb) {
				var res = {};

				logger.info('Budget Model keys: ' +
					JSON.stringify(Object.keys(Budget), null, '\t'));

				Budget.findOne(conditions, function (err, budget) {
				  if (err) {
						res.error = err;
						cb(err, res);
					}
				  logger.info('find one budget',
						JSON.stringify(budget, null, '\t'));
					res.budget = budget;
					cb(err, res);
				});
			},
			updateAllByProjectId: function(project_id, newBudgets, cb) {
				logger.info('new budgets: ' + JSON.stringify(newBudgets, null, '\t') + ' for projectId: ' + project_id);

				var mongoSequence = require('./../../server/lib/mongo-sequence');
				var app = Budget.app;
				// sequence
				var connector = app.dataSources.mongoBudgets.connector;
				var db = null;

				connector.connect(function(err, dbase){
					if (err) {
						throw err;
					}
					db = dbase;

					// update budgets
					if (project_id != null && project_id.length > 0) {
						update(project_id, newBudgets, cb);
					} else {
						cb(null, 'no projectId');
					}

				});
			},
			toISODate: function(budget) {
				var from = moment(budget.from, "DD/MM/YYYY");
				var to = moment(budget.to, "DD/MM/YYYY");
				budget.from = from.toDate();
				budget.to = to.toDate();
			},
			update: function(project_id, newBudgets, cb) {
				Budget.find({where: {projectId: parseInt(project_id)}}, function(err, oldBudgets){
					if (err) {
						throw err;
					}
					logger.info('old budgets: ' + JSON.stringify(oldBudgets, null, '\t'));

					var newLength = newBudgets.length;
					var oldLength = oldBudgets.length;
					if (oldLength > newLength) {
						logger.info('case 1');
						var diffLength = oldLength - newLength;
						newBudgets.forEach(function(currentBudget, i){
							var oldid = oldBudgets[i].id;
							oldBudgets[i] = currentBudget;
							oldBudgets[i].id = oldid;
						});
						var oldBudgetsToRemove = oldBudgets.slice(newLength, oldLength);
						logger.info('old budgets to remove: ' + JSON.stringify(oldBudgetsToRemove, null, '\t'));
						// remove old budgets
						oldBudgetsToRemove.forEach(function(currentBudget, i){
							Budget.destroyById(currentBudget.id);
						});

						oldBudgets.splice(newLength, diffLength);
						logger.info('spliced old budgets: ' + JSON.stringify(oldBudgets, null, '\t'));
						// update old budgets
						oldBudgets.forEach(function(currentBudget, i){
							logger.info('insert budget: ' + JSON.stringify(currentBudget, null, '\t'));
							toISODate(currentBudget);
							logger.info('insert budget: ' + JSON.stringify(currentBudget, null, '\t'));
							Budget.upsert(currentBudget);
						});
					} else if (oldLength < newLength) {
						logger.info('case 2');
						oldBudgets.forEach(function(currentBudget, i){
							logger.info('budget: ' + i + '; id = ' + newBudgets[i].id);
							newBudgets[i].id = currentBudget.id;
							logger.info('budget: ' + i + '; id = ' + newBudgets[i].id);
						});
						// update new budgets + sequence
						newBudgets.forEach(function(currentBudget, i){
							toISODate(currentBudget);
							if (currentBudget.id != null && currentBudget.id > 0) {
								Budget.upsert(currentBudget, function(err, updatedBudget) {
									logger.info('err: ' + err);
									logger.info('updatedBudget: ' + JSON.stringify(updatedBudget, null, '\t'));
								});
							} else {
								var budgetseq = mongoSequence(db,'budgets');
								budgetseq.getNext(function(err, sequence) {
									logger.info('budgetseq name: ' + budgetseq.name + '; no: ' + sequence);
									if (err) {
										callback(null, err, null, null);
									} else {
										logger.info('insert Budget with name: ' + JSON.stringify(currentBudget, null, '\t'));
										currentBudget.id = sequence;
										Budget.upsert(currentBudget, function(err, updatedBudget) {
											logger.info('err: ' + err);
											logger.info('updatedBudget: ' + JSON.stringify(updatedBudget, null, '\t'));
										});
									}
								});
							}
						});
					} else {
						logger.info('case 3');
						newBudgets.forEach(function(currentBudget, i){
							var oldid = oldBudgets[i].id;
							oldBudgets[i] = currentBudget;
							oldBudgets[i].id = oldid;
						});
						// update old budgets
						oldBudgets.forEach(function(currentBudget, i){
							toISODate(currentBudget);
							Budget.upsert(currentBudget, function(err, updatedBudget) {
								logger.info('err: ' + err);
								logger.info('updatedBudget: ' + JSON.stringify(updatedBudget, null, '\t'));
							});
						});
					}

					cb(null, 'projectId ' + project_id);
				});
			}
		}; // end res

		BudgetEmitter.emit('once', res);

	}); // end once

	return BudgetEmitter;

};

module.exports.Budget = Budget;
