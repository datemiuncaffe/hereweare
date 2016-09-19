var async = require('async');
module.exports = function(options) {
	var logger = require('./../../lib/logger');

	return function automigrate(req, res, next) {
		logger.info('init automigrate for generating models...');
		var app = req.app;
		// data sources
		var mongoDs = app.dataSources.mongoDs;

		// create all models
		async.parallel({
			customers : async.apply(createCustomers),
		}, function(err, results) {
			if (err) {
				throw err;
			}
			logger.info('Results: \n', results);
			var customer = results.customers[0];
			logger.info('customer: ' + customer);
			createProjects(customer, function(err, projects) {
				if (err) {
					throw err;
				}
				logger.info('Projects created: \n', projects);
				logger.info('project: ' + JSON.stringify(projects[0]));
				var project = projects[0];
				createBudgets(project, function(err, budgets) {
					if (err) {
						throw err;
					}
					logger.info('Budgets created: \n', budgets);
					var insertedData = {
						customer : customer,
						project : project,
						budgets : budgets
					};
					logger.info('insertedData: '
									+ JSON.stringify(insertedData));
					return res.json(insertedData);
				});
			});
		});
		// create customers
		function createCustomers(cb) {
			mongoDs.automigrate('Customer', function(err) {
				if (err) {
					throw err;
				}
				var Customer = app.models.Customer;
				Customer.create([ {
					name : 'Manzoni'
				}, {
					name : 'Idea'
				}, {
					name : 'Elmedia'
				}, {
					name : 'Sensei'
				}, {
					name : 'Cobra'
				}, {
					name : 'Climate'
				} ], cb);
			});
		}
		// create budgets
		function createBudgets(project, cb) {
			logger.info('createBudgets...');
			mongoDs.automigrate('Budget', function(err) {
				if (err) {
					return cb(err);
				}
				var Budget = app.models.Budget;
				Budget.create([ {
					month : 'GEN',
					days : 30,
					amount : 10000,
					projectId : project.id
				}, {
					month : 'FEB',
					days : 40,
					amount : 2000,
					projectId : project.id
				}, {
					month : 'MAR',
					days : 50,
					amount : 3000,
					projectId : project.id
				} ], cb);
			});
		}

		// create projects
		function createProjects(customer, cb) {
			mongoDs.automigrate('Project', function(err) {
				if (err) {
					return cb(err);
				}
				var Project = app.models.Project;
				Project.create([ {
					name : 'Supporto Manzoni',
					code : 'CF12001',
					budgettot : 2000,
					customerId : customer.id
				}, {
					name : 'Configuratore 1',
					code : 'CF11015',
					budgettot : 3000,
					customerId : customer.id
				}, {
					name : 'CF11001',
					code : 'CF11001',
					budgettot : 4000,
					customerId : customer.id
				}, {
					name : 'Gestione Credito 1',
					code : 'CF12903',
					budgettot : 5000,
					customerId : customer.id
				}, {
					name : 'Gestione Credito 2',
					code : 'CF12904',
					budgettot : 6000,
					customerId : customer.id
				}, {
					name : 'Cosuntivo 10/2012',
					code : 'CF12901',
					budgettot : 7000,
					customerId : customer.id
				} ], cb);
			});
		}
	}
};
