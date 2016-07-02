module.exports = function(app) {
	// Hooks to /api/customers get method
	var jp = require('jsonpath');
	var moment = require('moment');

	var remotes = app.remotes();
	remotes.after('Customer.find', function(ctx, next) {
//		console.log('remotes: ' + JSON.stringify(remotes.toJSON(), null, '\t'));
//		console.log('ctx result: ', ctx.result);
		var customers = ctx.result;

		var res = {
			customers: ctx.result
		};
		var resFiltered = JSON.parse(JSON.stringify(res));
		console.log('customer resFiltered: ' + JSON.stringify(res, null, '\t'));

//		var projects = jp.query(resFiltered, '$.customers[*].projects');
//		console.log('projects: ' + JSON.stringify(projects, null, '\t'));

		jp.apply(resFiltered, '$.customers[*].projects[*].from', function(from) {
			console.log('from: ' + from + '; typeof: ' + typeof from);
			if (from != null && from.length > 0) {
				var formattedfrom = moment(from).format('DD/MM/YYYY');
				console.log('formattedfrom: ' + formattedfrom);
				return formattedfrom;
			}
		});
		jp.apply(resFiltered, '$.customers[*].projects[*].to', function(to) {
			console.log('to: ' + to + '; typeof: ' + typeof to);
			if (to != null && to.length > 0) {
				var formattedto = moment(to).format('DD/MM/YYYY');
				console.log('formattedto: ' + formattedto);
				return formattedto;
			}
		});

		ctx.result = resFiltered.customers;

		next();
	});

	remotes.after('Project.find', function(ctx, next) {
		var res = {
			projects: ctx.result
		};
		var resFiltered = JSON.parse(JSON.stringify(res));
		console.log('project resFiltered: ' + JSON.stringify(res, null, '\t'));

		jp.apply(resFiltered, '$.projects[*].from', function(from) {
			console.log('project from: ' + from + '; typeof: ' + typeof from);
			if (from != null && from.length > 0) {
				var formattedfrom = moment(from).format('DD/MM/YYYY');
				console.log('formattedfrom: ' + formattedfrom);
				return formattedfrom;
			}
		});
		jp.apply(resFiltered, '$.projects[*].to', function(to) {
			console.log('project to: ' + to + '; typeof: ' + typeof to);
			if (to != null && to.length > 0) {
				var formattedto = moment(to).format('DD/MM/YYYY');
				console.log('formattedto: ' + formattedto);
				return formattedto;
			}
		});

		jp.apply(resFiltered, '$.projects[*].budgets[*].from', function(from) {
			console.log('budget from: ' + from + '; typeof: ' + typeof from);
			if (from != null && from.length > 0) {
				var formattedfrom = moment(from).format('DD/MM/YYYY');
				console.log('budget formattedfrom: ' + formattedfrom);
				return formattedfrom;
			}
		});
		jp.apply(resFiltered, '$.projects[*].budgets[*].to', function(to) {
			console.log('budget to: ' + to + '; typeof: ' + typeof to);
			if (to != null && to.length > 0) {
				var formattedto = moment(to).format('DD/MM/YYYY');
				console.log('budget formattedto: ' + formattedto);
				return formattedto;
			}
		});

		ctx.result = resFiltered.projects;

		next();
	});

	remotes.before('Project.updateAll', function(ctx, next) {
		var res = {
			projects: ctx.result
		};
		var resFiltered = JSON.parse(JSON.stringify(res));
		console.log('updateAll project resFiltered: ' + JSON.stringify(res, null, '\t'));

		// jp.apply(resFiltered, '$.projects[*].from', function(from) {
		// 	console.log('project from: ' + from + '; typeof: ' + typeof from);
		// 	if (from != null && from.length > 0) {
		// 		var formattedfrom = moment(from).format('DD/MM/YYYY');
		// 		console.log('formattedfrom: ' + formattedfrom);
		// 		return formattedfrom;
		// 	}
		// });

		ctx.result = resFiltered.projects;

		next();
	});

	function toISODate(project) {
    var from = moment(project.from, "DD/MM/YYYY");
    var to = moment(project.to, "DD/MM/YYYY");
    project.from = from.toDate();
    project.to = to.toDate();
  }

	remotes.before('Project.upsert', function(ctx, next) {
		console.log('upsert ctx keys: ' + Object.keys(ctx));
		console.log('upsert ctx.req keys: ' + Object.keys(ctx.req));
		console.log('upsert ctx.req.body keys: ' + Object.keys(ctx.req.body));
		console.log('upsert ctx.req.body: ' + JSON.stringify(ctx.req.body, null, '\t'));

		var project = ctx.req.body;
		toISODate(project);
		console.log('insert Project with name: ' + JSON.stringify(project, null, '\t'));

		// ctx.req = resFiltered.projects;

		next();
	});
};
