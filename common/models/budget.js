module.exports = function(Budget) {
	
	Budget.updateAllByProjectId = function(project_id, newBudgets, cb) {
		console.log('new budgets: ' + JSON.stringify(newBudgets, null, '\t') + ' for projectId: ' + project_id);
		
		if (project_id != null && project_id > 0) {
			Budget.find({where: {projectId: parseInt(project_id)}}, function(err, oldBudgets){
				if (err) {
					throw err;
				}
				console.log('old budgets: ' + JSON.stringify(oldBudgets, null, '\t'));
				
				var newLength = newBudgets.length;
				var oldLength = oldBudgets.length;
				if (oldLength > newLength) {
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
						Budget.upsert(currentBudget);						
					});					
				} else if (oldLength < newLength) {
					oldBudgets.forEach(function(currentBudget, i){
						newBudgets[i].id = currentBudget.id;						
					});
					// update new budgets + sequence
					newBudgets.forEach(function(currentBudget, i){
						Budget.upsert(currentBudget);						
					});					
				} else {
					newBudgets.forEach(function(currentBudget, i){
						var oldid = oldBudgets[i].id;
						oldBudgets[i] = currentBudget;
						oldBudgets[i].id = oldid;
					});
					// update old budgets
					oldBudgets.forEach(function(currentBudget, i){
						Budget.upsert(currentBudget);						
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