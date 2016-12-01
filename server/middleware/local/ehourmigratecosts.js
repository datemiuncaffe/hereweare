var MysqlPool = require('./../../lib/mysql-pool').pool();
var async = require('async');
module.exports = function(options) {
	var logger = require('./../../lib/logger');

	return function ehourmigratecosts(req, res, next) {
		logger.info('ehour migrate hours into mongo db costs...');

		// data sources model
		var app = req.app;
		var Project = app.models.Project;
		var Cost = app.models.Cost;

		var mongoSequence = require('./../../lib/mongo-sequence');

		// sequence
		var connector = app.dataSources.mongoDs.connector;
		var db = null;

		var q = async.priorityQueue(migrate, 1);
		// assign a callback
		q.drain = function() {
			logger.info('all projects have been processed');
		};

		var queryparams = req.query;
		var filter = {where:null};
		if (queryparams.customerId != null && queryparams.customerId > 0) {
			logger.info(typeof queryparams.customerId);
			filter.where = {customerId : parseInt(queryparams.customerId)};
			logger.info(JSON.stringify(filter));
		}

		Project.find(filter, function (err, projects) {
			logger.info('err: ' + err);
			if (err) {
				logger.info('err: ' + err);
			}
			logger.info('projects: ' + JSON.stringify(projects));
			res.json(projects);

			connector.connect(function(err, dbase){
				if (err) {
					throw err;
				}
				db = dbase;

				// process projects
				var count = 0;
				async.whilst(
				    function () { return count < projects.length; },
				    function (callback) {
				    	var project = projects[count];
				    	logger.info('project: ' + JSON.stringify(project));
						setTimeout(function () {
							q.push(project, null, function(err) {
								logger.info('end processing project = ' + project.name);
							});
							count++;
							callback(err, count);
				        }, 1000);
				    },
				    function (err, n) {
				        logger.info('end processing projects. number of projects = : ' + n);
				    }
				);
			});
		});


		function migrateCosts(project, cb) {
			logger.info('project: ' + project +
				'; code: ' + project.code);
			var query = 'select year(ENTRY_DATE) as anno, ' +
				'month(ENTRY_DATE) as mese, c.NAME as nomeCliente, ' +
				'p.PROJECT_CODE as codiceProgetto, ' +
				'p.NAME as nomeProgetto, ' +
				'round(sum(HOURS)/8,2) as giornateMese ' +
				'from TIMESHEET_ENTRY t ' +
				'join PROJECT_ASSIGNMENT a ' +
				'on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID ' +
				'join PROJECT p on a.PROJECT_ID = p.PROJECT_ID ' +
				'join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID ' +
				'group by anno, mese, c.CUSTOMER_ID, ' +
				'p.PROJECT_ID having codiceProgetto = \'' +
				project.code + '\' order by anno, mese;';

			MysqlPool.getPool(getConnection);

			function getConnection() {
				MysqlPool.getConnection(getData, query);
			};

			function getData(err, connection, query) {
				connection.query(query, function(err, costs) {
					if (err) {
						MysqlPool.releaseConnection(connection);
						throw err;
					}

					MysqlPool.releaseConnection(connection);
					var count = 0;
					async.whilst(
					    function () { return count < costs.length; },
					    function (callback) {
					    	logger.info('cost: ' + JSON.stringify(costs[count]));
					    	var cost = costs[count];

					    	var costseq = mongoSequence(db,'costs');
							costseq.getNext(function(err, sequence) {
								logger.info('costseq name: ' + costseq.name + '; no: ' + sequence);
								if (err) {
									count++;
									callback(err, count);
								} else {
									logger.info('insert Cost. nomeProgetto: ' + cost.nomeProgetto + '; codiceProgetto: ' + cost.codiceProgetto + '; anno: ' + cost.anno + '; mese: ' + cost.mese + '; giornateMese: ' + cost.giornateMese);
									Cost.create({
										id : sequence,
										year : cost.anno,
										month : cost.mese,
										days : cost.giornateMese,
										projectId : project.id
									}, function(err, mongocost) {
										if (err) {
											throw err;
										}
										logger.info('Cost created: \n', JSON.stringify(mongocost));
										count++;
										callback(err, count);
									});
								}
							});

					    },
					    function (err, n) {
					        logger.info('results: ' + n);
					        cb();
					    }
					);
				});
			};
		}

		function migrate(project, cb) {
			migrateCosts(project, cb);
		}

		return res;

	};
};
