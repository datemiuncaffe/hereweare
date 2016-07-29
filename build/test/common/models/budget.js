module.exports = function(Budget) {
	var moment = require('moment');

	Budget.updateAllByProjectId = function(project_id, newBudgets, cb) {
		console.log('new budgets: ' + JSON.stringify(newBudgets, null, '\t') + ' for projectId: ' + project_id);

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

		function toISODate(budget) {
	    var from = moment(budget.from, "DD/MM/YYYY");
	    var to = moment(budget.to, "DD/MM/YYYY");
	    budget.from = from.toDate();
	    budget.to = to.toDate();
	  }

		function update(project_id, newBudgets, cb) {
			Budget.find({where: {projectId: parseInt(project_id)}}, function(err, oldBudgets){
				if (err) {
					throw err;
				}
				console.log('old budgets: ' + JSON.stringify(oldBudgets, null, '\t'));

				var newLength = newBudgets.length;
				var oldLength = oldBudgets.length;
				if (oldLength > newLength) {
					console.log('case 1');
					var diffLength = oldLength - newLength;
					newBudgets.forEach(function(currentBudget, i){
						var oldid = oldBudgets[i].id;
						oldBudgets[i] = currentBudget;
						oldBudgets[i].id = oldid;
					});
					var oldBudgetsToRemove = oldBudgets.slice(newLength, oldLength);
					console.log('old budgets to remove: ' + JSON.stringify(oldBudgetsToRemove, null, '\t'));
					// remove old budgets
					oldBudgetsToRemove.forEach(function(currentBudget, i){
						Budget.destroyById(currentBudget.id);
					});

					oldBudgets.splice(newLength, diffLength);
					console.log('spliced old budgets: ' + JSON.stringify(oldBudgets, null, '\t'));
					// update old budgets
					oldBudgets.forEach(function(currentBudget, i){
						console.log('insert budget: ' + JSON.stringify(currentBudget, null, '\t'));
	          toISODate(currentBudget);
	          console.log('insert budget: ' + JSON.stringify(currentBudget, null, '\t'));
						Budget.upsert(currentBudget);
					});
				} else if (oldLength < newLength) {
					console.log('case 2');
					oldBudgets.forEach(function(currentBudget, i){
						console.log('budget: ' + i + '; id = ' + newBudgets[i].id);
						newBudgets[i].id = currentBudget.id;
						console.log('budget: ' + i + '; id = ' + newBudgets[i].id);
					});
					// update new budgets + sequence
					newBudgets.forEach(function(currentBudget, i){
	          toISODate(currentBudget);
						if (currentBudget.id != null && currentBudget.id > 0) {
							Budget.upsert(currentBudget, function(err, updatedBudget) {
								console.log('err: ' + err);
								console.log('updatedBudget: ' + JSON.stringify(updatedBudget, null, '\t'));
							});
						} else {
							var budgetseq = mongoSequence(db,'budgets');
							budgetseq.getNext(function(err, sequence) {
								console.log('budgetseq name: ' + budgetseq.name + '; no: ' + sequence);
								if (err) {
									callback(null, err, null, null);
								} else {
									console.log('insert Budget with name: ' + JSON.stringify(currentBudget, null, '\t'));
									currentBudget.id = sequence;
									Budget.upsert(currentBudget, function(err, updatedBudget) {
										console.log('err: ' + err);
										console.log('updatedBudget: ' + JSON.stringify(updatedBudget, null, '\t'));
									});
								}
							});
						}
					});
				} else {
					console.log('case 3');
					newBudgets.forEach(function(currentBudget, i){
						var oldid = oldBudgets[i].id;
						oldBudgets[i] = currentBudget;
						oldBudgets[i].id = oldid;
					});
					// update old budgets
					oldBudgets.forEach(function(currentBudget, i){
	          toISODate(currentBudget);
						Budget.upsert(currentBudget, function(err, updatedBudget) {
							console.log('err: ' + err);
							console.log('updatedBudget: ' + JSON.stringify(updatedBudget, null, '\t'));
						});
					});
				}

				cb(null, 'projectId ' + project_id);

			});

		}

	};

	Budget.remoteMethod(
		'updateAllByProjectId',
		{
		  accepts:	[{arg: 'projectId', type: 'string'},{arg: 'budgets', type: ['object']}],
		  returns: {arg: 'budgets', type: 'string'},
		  http: {path: '/updateAllByProjectId', verb: 'put'}
		}
	);
};
