var mysql = require('mysql');
var async = require('async');
module.exports = function(options) {
	return function ehourmigrate(req, res, next) {
		console.log('ehour migrate into mongo db...');
		
		var mongoSequence = require('./../../lib/mongo-sequence');
		// data sources model
		var app = req.app;
		var Customer = app.models.Customer;
		var Project = app.models.Project;
		
		var con = mysql.createConnection({
			host : '192.168.88.158',
			user : 'centos',
			database : 'ehour'
		});
		
		// sequence
		var connector = app.dataSources.mongoDs.connector;
		var db = null;

		var q = async.priorityQueue(migrate, 1);
		// assign a callback
		q.drain = function() {
			console.log('all items have been processed');
		};
		
		con.query('select * from CUSTOMER', function(err, rows) {
			if (err) {
				throw err;
			}

			var customers = JSON.parse(JSON.stringify(rows));
			console.log('ehour customers: ' + customers);			
			res.json(customers);
			
			connector.connect(function(err, dbase){
				if (err) {
					throw err;
				}
				db = dbase;
				
				// process customers
				customers.forEach(function(customer) {
					console.log('customer: ' + JSON.stringify(customer));
					q.push(customer, null, function(err) {
						console.log('end processing customer = ' + customer.NAME);
					});
				});					
				
			});
			
		});
		
		// migrate Customer
		function migrateCustomer(customer, callback) {
			var customerseq = mongoSequence(db,'customers');
			customerseq.getNext(function(err, sequence) {
				console.log('customerseq name: ' + customerseq.name + '; no: ' + sequence);
				if (err) {
					callback(null, err, null, null);
				} else {					
					console.log('insert Customer with name: ' + customer.NAME);
					Customer.create({
						id : sequence,
						name : customer.NAME
					}, function(err, mongocustomer) {
						if (err) {
							throw err;
						}
						console.log('Customer created on mongo: \n', JSON.stringify(mongocustomer));
						callback(null, null, sequence, customer.CUSTOMER_ID);
					});					
				}			
			});
		}
		
		function migrateProjects(err, customerId, ehourcustomerId, callback) {
			if (err) {
				throw err;
			}
			console.log('customerId: ' + customerId + '; ehourcustomerId: ' + ehourcustomerId);
			
			con.query('select * from PROJECT where CUSTOMER_ID = ' + ehourcustomerId, function(err, projects) {
				if (err) {
					throw err;
				}

				var count = 0;

				async.whilst(
				    function () { return count < projects.length; },
				    function (callback) {
				    	
				    	var projectseq = mongoSequence(db,'projects');
						projectseq.getNext(function(err, sequence) {
							console.log('projectseq name: ' + projectseq.name + '; no: ' + sequence);
							if (err) {
								count++;
						        setTimeout(function () {
						            callback(err, count);
						        }, 1000);
							} else {
								console.log('insert Project with name: ' + projects[count].NAME);
								Project.create({
									id : sequence,
									name : projects[count].NAME,
									code : projects[count].PROJECT_CODE,
									customerId : customerId
								}, function(err, mongoproject) {
									if (err) {
										throw err;
									}
									console.log('Project created: \n', JSON.stringify(mongoproject));
									count++;
							        setTimeout(function () {
							            callback(null, count);
							        }, 1000);
								});
							}			
						});			    	
				        
				    },
				    function (err, n) {
				        console.log('results: ' + n);
				    }
				);				
			});			
		}
		
		function migrate(customer, cb) {
			async.waterfall([ 
			                  async.apply(migrateCustomer, customer), 
			                  migrateProjects
			                ],
				function(err, result) {
					if (err) {
						throw err;
					}
					console.log('end migrate...' + result);
			});
			cb();
		}

		return res;
	
	}  
};