module.exports = function(Budget) {
//	Budget.validatesInclusionOf('month', {in: ['GEN', 'FEB', 'MAR']});
//	Budget.validatesInclusionOf('type', {in: ['M', 'Y']});
//	
	
	Budget.updateAllByProjectId = function(projectId, budgets, cb) {
		console.log('projectId = ' + projectId);
		console.log('budgets: ' + JSON.stringify(budgets));
		
		if (budgets != null && budgets.length > 0) {
			console.log('updating budgets...');
			for (budget in budgets) {
				console.log(' updating budget: ' + budget);
				console.log('budget month: ' + budgets[budget].month);
				Budget.upsert(budgets[budget]);
			}
//			Budget.updateAll(budgets);
		}
		cb(null, 'Hello ' + projectId);
	};
	
	Budget.remoteMethod(
		'updateAllByProjectId', 
		{
		  accepts:	[{arg: 'projectId', type: 'string'},{arg: 'budgets', type: ['object']}],
		  returns: {arg: 'greeting', type: 'string'},
		  http: {path: '/updateAllByProjectId', verb: 'put'}
		}
	); 
};