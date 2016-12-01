var MysqlPool = require('./../../lib/mysql-pool').pool();
var async = require('async');
module.exports = function(options) {
	var logger = require('./../../lib/logger');

	return function ehourmigrate(req, res, next) {
		logger.info('ehour migrate into mongo db...');

		var mongoSequence = require('./../../lib/mongo-sequence');
		// data sources model
		var app = req.app;
		var Customer = app.models.Customer;
		var Project = app.models.Project;

		// sequence
		var connector = app.dataSources.mongoDs.connector;
		var db = null;

		var q = async.priorityQueue(migrate, 1);
		// assign a callback
		q.drain = function() {
			logger.info('all items have been processed');
		};

		var queryCustomers = 'select * from CUSTOMER';
		MysqlPool.getPool(getConnection);

		function getConnection() {
			MysqlPool.getConnection(getData, query);
		};

		function getData(err, connection, queryCustomers) {
			connection.query(queryCustomers, function(err, rows) {
				if (err) {
					MysqlPool.releaseConnection(connection);
					throw err;
				}

				MysqlPool.releaseConnection(connection);
				var customers = JSON.parse(JSON.stringify(rows));
				logger.info('ehour customers: ' + customers);
				res.json(customers);

				connector.connect(function(err, dbase){
					if (err) {
						throw err;
					}
					db = dbase;

					// process customers
					customers.forEach(function(customer) {
						logger.info('customer: ' + JSON.stringify(customer));
						q.push(customer, null, function(err) {
							logger.info('end processing customer = ' + customer.NAME);
						});
					});
				});
			});
		};

		// migrate Customer
		function migrateCustomer(customer, callback) {
			var customerseq = mongoSequence(db,'customers');
			customerseq.getNext(function(err, sequence) {
				logger.info('customerseq name: ' + customerseq.name + '; no: ' + sequence);
				if (err) {
					callback(null, err, null, null);
				} else {
					logger.info('insert Customer with name: ' + customer.NAME);
					Customer.create({
						id : sequence,
						name : customer.NAME
					}, function(err, mongocustomer) {
						if (err) {
							throw err;
						}
						logger.info('Customer created on mongo: \n', JSON.stringify(mongocustomer));
						callback(null, null, sequence, customer.CUSTOMER_ID);
					});
				}
			});
		}

		function migrateProjects(err, customerId, ehourcustomerId, callback) {
			if (err) {
				throw err;
			}
			logger.info('customerId: ' + customerId + '; ehourcustomerId: ' + ehourcustomerId);
			var query = 'select * from PROJECT where ' +
				'CUSTOMER_ID = ' + ehourcustomerId;

			MysqlPool.getPool(getConnection);

			function getConnection() {
				MysqlPool.getConnection(getData, query);
			};

			function getData(err, connection, query) {
				connection.query(query, function(err, projects) {
					if (err) {
						MysqlPool.releaseConnection(connection);
						throw err;
					}

					var count = 0;
					async.whilst(
					    function () { return count < projects.length; },
					    function (callback) {

					    	var projectseq = mongoSequence(db,'projects');
							projectseq.getNext(function(err, sequence) {
								logger.info('projectseq name: ' + projectseq.name + '; no: ' + sequence);
								if (err) {
									count++;
							        setTimeout(function () {
							            callback(err, count);
							        }, 1000);
								} else {
									logger.info('insert Project with name: ' + projects[count].NAME);
									Project.create({
										id : sequence,
										name : projects[count].NAME,
										code : projects[count].PROJECT_CODE,
										customerId : customerId
									}, function(err, mongoproject) {
										if (err) {
											throw err;
										}
										logger.info('Project created: \n', JSON.stringify(mongoproject));
										count++;
								        setTimeout(function () {
								            callback(null, count);
								        }, 1000);
									});
								}
							});

					    },
					    function (err, n) {
					        logger.info('results: ' + n);
									MysqlPool.releaseConnection(connection);
					    }
					);
					res.json(results);
				});
			};
		};

		function migrate(customer, cb) {
			async.waterfall([
          async.apply(migrateCustomer, customer),
          migrateProjects
        ],
				function(err, result) {
					if (err) {
						throw err;
					}
					logger.info('end migrate...' + result);
			});
			cb();
		};

		return res;

	}
};
