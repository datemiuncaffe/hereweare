var mysql = require('mysql');
var async = require('async');
module.exports = function(options) {
	return function ehourmigrate(req, res, next) {
		console.log('ehour migrate into mongo db...');

		var q = async.priorityQueue(function(task, callback) {
			if (task.NAME != null && task.NAME.length > 0) {
				console.log('Customer name: ' + task.NAME);
			}
			callback();
		}, 1);
		// assign a callback
		q.drain = function() {
			console.log('all items have been processed');
		};
		
		// reading database
		var con = mysql.createConnection({
			host : '192.168.88.158',
			user : 'centos',
			database : 'ehour'
		});

		var resList = {
			results : []
		};
		con.query('select * from CUSTOMER', function(err, rows) {
			if (err) {
				throw err;
			}

			var customers = JSON.parse(JSON.stringify(rows));
			console.log('ehour customers: ' + customers);
			resList['results'] = customers;
			console.log('resList: ' + JSON.stringify(resList));
			res.json(resList);
			
			// process customers
			customers.forEach(function(customer) {
				console.log('customer: ' + JSON.stringify(customer));
				q.push(customer, null, function(err) {
					console.log('ERROR during processing customer = ' + customer.NAME);
				});
			});			
			
		});

		return res;
	
	
//		
//		
// var app = req.app;
// // data sources
// var mongoDs = app.dataSources.mongoDs;
//		var db = null;
//		
//		var connector = mongoDs.connector;
//		if (typeof connector.connect == 'function') {
//			console.log('connector: ' + JSON.stringify(connector.connect));
//			connector.connect(function(err, dbase){
//				if (err) {
//					throw err;
//				}
//				db = dbase;
//				automigrate();
//			});
//		}
//
//		// create all models
//		function automigrate() {
//			async.parallel({
//				customers : async.apply(createCustomers),
//			}, function(err, results) {
//				if (err) {
//					throw err;
//				}
//				console.log('Results: \n', results);
//				var customer = results.customers[0];
//				console.log('customer: ' + customer);
//				createProjects(customer, function(err, projects) {
//					if (err) {
//						throw err;
//					}
//					console.log('Projects created: \n', projects);
//					console.log('project: ' + JSON.stringify(projects[0]));
//					var project = projects[0];
//					createBudgets(project, function(err, budgets) {
//						if (err) {
//							throw err;
//						}
//						console.log('Budgets created: \n', budgets);
//						var insertedData = {
//							customer : customer,
//							project : project,
//							budgets : budgets
//						};
//						console
//								.log('insertedData: '
//										+ JSON.stringify(insertedData));
//						return res.json(insertedData);
//					});
//				});
//			});
//		}
//		
//		// create customers
//		function createCustomers(cb) {
//			
//			var customerseq = mongoSequence(db,'customers');
//			customerseq.getNext(function(err, sequence) {
//				console.log('customerseq name: ' + customerseq.name + '; no: ' + sequence);
//				if (err) {
//					callback(null, err, sequence);
//				} else {
//					console.log('insert customer Mongo');
//					Customer.create({
//						id : sequence,
//						name : 'Mongo'
//					}, function(err, customer) {
//						if (err) {
//							throw err;
//						}
//						console.log('Customer created: \n', JSON.stringify(customer));
//						callback(null, null, sequence);
//					});				
//				}			
//			});
//			
//			
//			
//			mongoDs.automigrate('Customer', function(err) {
//				if (err) {
//					throw err;
//				}
//				var Customer = app.models.Customer;
//				Customer.create([ {
//					name : 'Manzoni'
//				}, {
//					name : 'Idea'
//				}, {
//					name : 'Elmedia'
//				}, {
//					name : 'Sensei'
//				}, {
//					name : 'Cobra'
//				}, {
//					name : 'Climate'
//				} ], cb);
//			});
//		}
//		// create budgets
//		function createBudgets(project, cb) {
//			console.log('createBudgets...');
//			mongoDs.automigrate('Budget', function(err) {
//				if (err) {
//					return cb(err);
//				}
//				var Budget = app.models.Budget;
//				Budget.create([ {
//					month : 'GEN',
//					days : 30,
//					amount : 10000,
//					projectId : project.id
//				}, {
//					month : 'FEB',
//					days : 40,
//					amount : 2000,
//					projectId : project.id
//				}, {
//					month : 'MAR',
//					days : 50,
//					amount : 3000,
//					projectId : project.id
//				} ], cb);
//			});
//		}
//
//		// create projects
//		function createProjects(customer, cb) {
//			mongoDs.automigrate('Project', function(err) {
//				if (err) {
//					return cb(err);
//				}
//				var Project = app.models.Project;
//				Project.create([ {
//					name : 'Supporto Manzoni',
//					code : 'CF12001',
//					budgettot : 2000,
//					customerId : customer.id
//				}, {
//					name : 'Configuratore 1',
//					code : 'CF11015',
//					budgettot : 3000,
//					customerId : customer.id
//				}, {
//					name : 'CF11001',
//					code : 'CF11001',
//					budgettot : 4000,
//					customerId : customer.id
//				}, {
//					name : 'Gestione Credito 1',
//					code : 'CF12903',
//					budgettot : 5000,
//					customerId : customer.id
//				}, {
//					name : 'Gestione Credito 2',
//					code : 'CF12904',
//					budgettot : 6000,
//					customerId : customer.id
//				}, {
//					name : 'Cosuntivo 10/2012',
//					code : 'CF12901',
//					budgettot : 7000,
//					customerId : customer.id
//				} ], cb);
//			});
//		}	   
	}  
};