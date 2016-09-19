module.exports = function(app) {
	// Hooks to /api/customers get method
	var jp = require('jsonpath');
	var moment = require('moment');
	var logger = require('./../lib/logger');

	var remotes = app.remotes();
	remotes.after('Customer.find', function(ctx, next) {
//		logger.info('remotes: ' + JSON.stringify(remotes.toJSON(), null, '\t'));
//		logger.info('ctx result: ', ctx.result);
		var customers = ctx.result;

		var res = {
			customers: ctx.result
		};
		var resFiltered = JSON.parse(JSON.stringify(res));
		logger.info('customer resFiltered: ' + JSON.stringify(res, null, '\t'));

//		var projects = jp.query(resFiltered, '$.customers[*].projects');
//		logger.info('projects: ' + JSON.stringify(projects, null, '\t'));

		jp.apply(resFiltered, '$.customers[*].projects[*].from', function(from) {
			logger.info('from: ' + from + '; typeof: ' + typeof from);
			if (from != null && from.length > 0) {
				var formattedfrom = moment(from).format('DD/MM/YYYY');
				logger.info('formattedfrom: ' + formattedfrom);
				return formattedfrom;
			}
		});
		jp.apply(resFiltered, '$.customers[*].projects[*].to', function(to) {
			logger.info('to: ' + to + '; typeof: ' + typeof to);
			if (to != null && to.length > 0) {
				var formattedto = moment(to).format('DD/MM/YYYY');
				logger.info('formattedto: ' + formattedto);
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
		logger.info('project resFiltered: ' + JSON.stringify(res, null, '\t'));

		jp.apply(resFiltered, '$.projects[*].from', function(from) {
			logger.info('project from: ' + from + '; typeof: ' + typeof from);
			if (from != null && from.length > 0) {
				var formattedfrom = moment(from).format('DD/MM/YYYY');
				logger.info('formattedfrom: ' + formattedfrom);
				return formattedfrom;
			}
		});
		jp.apply(resFiltered, '$.projects[*].to', function(to) {
			logger.info('project to: ' + to + '; typeof: ' + typeof to);
			if (to != null && to.length > 0) {
				var formattedto = moment(to).format('DD/MM/YYYY');
				logger.info('formattedto: ' + formattedto);
				return formattedto;
			}
		});

		jp.apply(resFiltered, '$.projects[*].budgets[*].from', function(from) {
			logger.info('budget from: ' + from + '; typeof: ' + typeof from);
			if (from != null && from.length > 0) {
				var formattedfrom = moment(from).format('DD/MM/YYYY');
				logger.info('budget formattedfrom: ' + formattedfrom);
				return formattedfrom;
			}
		});
		jp.apply(resFiltered, '$.projects[*].budgets[*].to', function(to) {
			logger.info('budget to: ' + to + '; typeof: ' + typeof to);
			if (to != null && to.length > 0) {
				var formattedto = moment(to).format('DD/MM/YYYY');
				logger.info('budget formattedto: ' + formattedto);
				return formattedto;
			}
		});

		ctx.result = resFiltered.projects;

		next();
	});

	remotes.after('Project.findById', function(ctx, next) {
		var res = {
			project: ctx.result
		};
		var resFiltered = JSON.parse(JSON.stringify(res));
		logger.info('project resFiltered: ' + JSON.stringify(res, null, '\t'));

		jp.apply(resFiltered, '$.project.from', function(from) {
			logger.info('project from: ' + from + '; typeof: ' + typeof from);
			if (from != null && from.length > 0) {
				var formattedfrom = moment(from).format('DD/MM/YYYY');
				logger.info('formattedfrom: ' + formattedfrom);
				return formattedfrom;
			}
		});
		jp.apply(resFiltered, '$.project.to', function(to) {
			logger.info('project to: ' + to + '; typeof: ' + typeof to);
			if (to != null && to.length > 0) {
				var formattedto = moment(to).format('DD/MM/YYYY');
				logger.info('formattedto: ' + formattedto);
				return formattedto;
			}
		});

		jp.apply(resFiltered, '$.project.budgets[*].from', function(from) {
			logger.info('budget from: ' + from + '; typeof: ' + typeof from);
			if (from != null && from.length > 0) {
				var formattedfrom = moment(from).format('DD/MM/YYYY');
				logger.info('budget formattedfrom: ' + formattedfrom);
				return formattedfrom;
			}
		});
		jp.apply(resFiltered, '$.project.budgets[*].to', function(to) {
			logger.info('budget to: ' + to + '; typeof: ' + typeof to);
			if (to != null && to.length > 0) {
				var formattedto = moment(to).format('DD/MM/YYYY');
				logger.info('budget formattedto: ' + formattedto);
				return formattedto;
			}
		});

		ctx.result = resFiltered.project;

		next();
	});

	remotes.before('Project.updateAll', function(ctx, next) {
		var res = {
			projects: ctx.result
		};
		var resFiltered = JSON.parse(JSON.stringify(res));
		logger.info('updateAll project resFiltered: ' + JSON.stringify(res, null, '\t'));

		// jp.apply(resFiltered, '$.projects[*].from', function(from) {
		// 	logger.info('project from: ' + from + '; typeof: ' + typeof from);
		// 	if (from != null && from.length > 0) {
		// 		var formattedfrom = moment(from).format('DD/MM/YYYY');
		// 		logger.info('formattedfrom: ' + formattedfrom);
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
		logger.info('upsert ctx keys: ' + Object.keys(ctx));
		logger.info('upsert ctx.req keys: ' + Object.keys(ctx.req));
		logger.info('upsert ctx.req.body keys: ' + Object.keys(ctx.req.body));
		logger.info('upsert ctx.req.body: ' + JSON.stringify(ctx.req.body, null, '\t'));

		var project = ctx.req.body;
		toISODate(project);
		logger.info('insert Project with name: ' + JSON.stringify(project, null, '\t'));

		// ctx.req = resFiltered.projects;

		next();
	});
};
