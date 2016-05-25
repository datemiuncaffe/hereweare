module.exports = function(app) {
	console.log('add data on startup ...');
	
	var async = require("async");
	var moment = require("moment");
	const crypto = require('crypto');
	const hash = crypto.createHash('sha256');
	var mongoSequence = require('./../lib/mongo-sequence');
	var db = null;
	// data sources model	
	var Customer = app.models.Customer;
	var Project = app.models.Project;
	var Budget = app.models.Budget;
	
	// add Customer
	var addCustomer = function(callback) {
		var customerseq = mongoSequence(db,'customers');
		customerseq.getNext(function(err, sequence) {
			console.log('customerseq name: ' + customerseq.name + '; no: ' + sequence);
			if (err) {
				callback(null, err, sequence);
			} else {
				console.log('insert customer Mongo');
				Customer.create({
					id : sequence,
					name : 'Mongo'
				}, function(err, customer) {
					if (err) {
						throw err;
					}
					console.log('Customer created: \n', JSON.stringify(customer));
					callback(null, null, sequence);
				});				
			}			
		});
	};
	
	// add Project
	var addProject = function(err, customerId, callback) {
		if (err) {
			throw err;
		}
		var projectseq = mongoSequence(db,'projects');
		projectseq.getNext(function(err, sequence) {
			console.log('projectseq name: ' + projectseq.name + '; no: ' + sequence);
			if (err) {
				callback(null, err, sequence);
			} else {
				console.log('insert project START');
				var today = moment();
				var nextMonth = today.clone().add(1, 'months');
				hash.update('START' + today.valueOf());
				Project.create({
					id : sequence,
					name : 'START',
					code : hash.digest('hex'),
					from : today.format("DD MMM YYYY"),
					to : nextMonth.format("DD MMM YYYY"),
					budgettot : today.daysInMonth() * 100,
					customerId : customerId
				}, function(err, project) {
					if (err) {
						throw err;
					}
					console.log('Project created: \n', JSON.stringify(project));
					callback(null, null, project);
				});				
			}			
		});
	};
	
	// add Budget
	var addBudget = function(err, project, callback) {
		if (err) {
			throw err;
		}
		var budgetseq = mongoSequence(db,'budgets');
		budgetseq.getNext(function(err, sequence) {
			console.log('budgetseq name: ' + budgetseq.name + '; no: ' + sequence);
			if (err) {
				callback(err, 'error');
			} else {
				console.log('insert budget');
				Budget.create({
					id : sequence,
					from : project.from,
					to : project.to,
					days : moment(project.from).daysInMonth(),
					month : moment.months()[moment(project.from).month()],
					amount : project.budgettot,
					projectId : project.id
				}, function(err, budget) {
					if (err) {
						throw err;
					}
					console.log('Budget created: \n', JSON.stringify(budget));
				});
				callback(null, 'done');
			}			
		});
	};
	
	// sequence
	var connector = app.dataSources.mongoDs.connector;
	if (typeof connector.connect == 'function') {
		console.log('connector: ' + JSON.stringify(connector.connect));
		connector.connect(function(err, dbase){
			if (err) {
				throw err;
			}
			db = dbase;
			
			async.waterfall([ 
				addCustomer, 
				addProject,
				addBudget, 
				],
				function(err, result) {
					if (err) {
						throw err;
					}
					console.log('end waterfall...' + result);
				}
			);						
			
		});
	}
	
	
			
//	var _ = require('glutils');
//	  //... within a fiber thread at this point
//	  if (!err) {
//	    db.employees.insert(
//	      {
//	        _id: _.p(empseq.getNext(_.p())),
//	        name: "Sarah C."
//	      }
//	    )
//	  }	
	
};