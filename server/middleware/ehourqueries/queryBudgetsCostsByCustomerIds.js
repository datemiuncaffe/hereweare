module.exports = function(options) {
	var jp = require('jsonpath');
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var MongoPool = require('./../../lib/mongo-pool').pool();
	var async = require("async");
	var moment = require('moment');
	var logger = require('./../../lib/logger');

	var months = ['Gennaio','Febbraio','Marzo','Aprile','Maggio',
								'Giugno','Luglio','Agosto','Settembre','Ottobre',
								'Novembre','Dicembre'];

	function Padder(len, pad) {
		if (len === undefined) {
			len = 1;
		} else if (pad === undefined) {
			pad = '0';
		}

		var pads = '';
		while (pads.length < len) {
			pads += pad;
		}

		this.pad = function(what) {
			var s = what.toString();
			return pads.substring(0, pads.length - s.length) + s;
		};
	};

	function processData(data) {
		var results = [];
		var dataCosts = data[0];
		var dataBudgets = data[1];
		var zero2 = new Padder(2);

		if (dataBudgets != null) {
			if (dataBudgets.length == 1 &&
				 dataBudgets[0].error != null) {
				dataCosts.forEach(function(customerCosts) {
					var costs = customerCosts.datatable;
					if (costs != null && costs.length > 0) {
						costs.forEach(function(cost) {
							cost.id = '-' + cost.projectId + '-' + cost.year + '-' + zero2.pad(cost.month);
							cost.month = months[cost.month - 1];
							cost.budgetfrom = null;
							cost.budgetto = null;
							cost.budgetamount = null;
							cost.budgetdays = null;
						});
						results.push(customerCosts);
					}
				});
			} else {
				dataBudgets.forEach(function(customerBudgets) {
					var customerId = customerBudgets.customerId;
					logger.info('customerId: ' + customerId);
					var budgets = customerBudgets.datatable;
					logger.info('budgets: ' + JSON.stringify(budgets, null, '\t'));

					var customerCosts = dataCosts.filter(function(dataCost) {
						return (dataCost.customerId == customerId);
					});
					var costs = customerCosts[0].datatable;
					logger.info('costs: ' + JSON.stringify(costs, null, '\t'));

					var result = customerBudgets;
					if ((budgets != null && budgets.length > 0) ||
							(costs != null && costs.length > 0)) {
						costs.forEach(function(cost) {
							var corrbudget = budgets.filter(function(budget) {
								return (budget.projectId == cost.projectId &&
												budget.projectname == cost.projectname &&
												budget.year == cost.year &&
												budget.month == months[cost.month - 1]);
							});
							logger.info('corrbudget: ' + JSON.stringify(corrbudget, null, '\t'));
							if (corrbudget.length == 1) {
								corrbudget[0].id += '-' + cost.projectId + '-' + cost.year + '-' + zero2.pad(cost.month);
								corrbudget[0].costdays = cost.costdays;
								corrbudget[0].costhours = cost.costhours;
								logger.info('corrbudget MODIFIED: ' + JSON.stringify(corrbudget, null, '\t'));
							} else if (corrbudget.length == 0) {
								cost.id = '-' + cost.projectId + '-' + cost.year + '-' + zero2.pad(cost.month);
								cost.month = months[cost.month - 1];
								cost.budgetfrom = null;
								cost.budgetto = null;
								cost.budgetamount = null;
								cost.budgetdays = null;
								result.datatable.push(cost);
							}
						});
						logger.info('result: ' + JSON.stringify(result, null, '\t'));
						results.push(result);
					}
				});
			}
		}

		logger.info("results: " + JSON.stringify(results, null, '\t'));
		return results;
	};

	function getDataByCustomerId(connection, customerId, projectGroup, cb) {
		if (customerId != null && customerId > 0) {
			logger.info('customerId: ' + customerId);

			var now = moment();
			var lowdatelimit = now.subtract(2, 'months').format('YYYY-MM-DD');
			logger.info('lowdatelimit for active and new projects: ' + lowdatelimit);

			var baseqry = 'select p.PROJECT_ID as projectId, p.NAME as projectname, p.PROJECT_CODE as projectcode,'
				+ ' year(ENTRY_DATE) as year, month(ENTRY_DATE) as month, round(sum(HOURS)/8,2) as costdays,'
				+ ' sum(HOURS) as costhours'
				+ ' from TIMESHEET_ENTRY t'
				+ ' join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID'
				+ ' join PROJECT p on a.PROJECT_ID = p.PROJECT_ID'
				+ ' join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID';
			var postqry = ' group by projectId, projectname, year, month order by projectname, projectcode, year, month;';

			var queries = {
				ALL: baseqry + ' WHERE c.CUSTOMER_ID = \'' + customerId + '\'' + postqry,
				INT: baseqry + ' WHERE c.CUSTOMER_ID = \'' + customerId + '\'' + postqry,
				EXT: baseqry + ' WHERE c.CUSTOMER_ID = \'' + customerId + '\'' + postqry,
				NOTACTIVE: '',
				ACTIVE: baseqry + ' WHERE t.ENTRY_DATE IS NOT NULL AND t.ENTRY_DATE > \'' + lowdatelimit + '\' AND c.CUSTOMER_ID = \'' + customerId + '\'' + postqry,
				NEW: baseqry + ' WHERE a.DATE_START IS NOT NULL AND a.DATE_START > \'' + lowdatelimit + '\' AND c.CUSTOMER_ID = \'' + customerId + '\'' + postqry
			};

			var query = queries.ALL;
			if (projectGroup != null) {
				if (projectGroup == 'INT') {
					query = queries.INT;
				} else if (projectGroup == 'EXT') {
					query = queries.EXT;
				} else if (projectGroup == 'ACTIVE') {
					query = queries.ACTIVE;
				} else if (projectGroup == 'NOTACTIVE') {
					query = queries.NOTACTIVE;
				} else if (projectGroup == 'NEW') {
					query = queries.NEW;
				}
			}

			logger.info('query: ' + query);
			logger.info('connection: ' + connection + '; query: ' + query);

			connection.query(query, function(err, data) {
				if (err) {
					logger.info('err: ' + JSON.stringify(err));
					throw err;
				}

				logger.info('queryBudgetsCostsByCustomerId performed ...');
				logger.info('data: ' + JSON.stringify(data, null, '\t'));
				cb(data);
			});

		} else {
			cb([]);
		}
	};

	return function queryBudgetsCostsByCustomerIds(req, res, next) {
		// parse query string parameters
		var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams));

		if (queryparams.customerIds != null && queryparams.customerIds.length > 0) {
			var customerIds = queryparams.customerIds.split(',');
			logger.info('customerIds: ' + JSON.stringify(customerIds));

			async.parallel([
		    function(callback) {
					MysqlPool.getPool(getConnection);

					function getConnection() {
						MysqlPool.getConnection(getData, customerIds);
					};
					function getData(err, connection, customerIds) {
						var costsresults = [];
						async.each(customerIds, function(custId, callbk) {
							getDataByCustomerId(connection, custId, queryparams.projectGroup, function(res) {
								var result = {customerId:custId,datatable:res};
								costsresults.push(result);
								callbk();
							});
						}, function(err) {
								if( err ) {
									logger.info('error: ' + JSON.stringify(err, null, '\t'));
									costsresults.push({error: err});
								}
								MysqlPool.releaseConnection(connection);
								callback(null, costsresults);
						});
					};
		    },
		    function(callback) {
					MongoPool.getConnection(getData, customerIds);
					function getData(err, db, customerIds) {
						var budgetsresults = [];
						if( err ) {
							logger.info('mongo connection error: ' +
								JSON.stringify(err, null, '\t'));
							budgetsresults.push({error: err});
							callback(null, budgetsresults);
						} else {
							async.each(customerIds, function(custId, callbk) {
								db.collection('Project', function(err, collection) {
									collection.aggregate([
										{
											$match: {customerId:parseInt(custId)}
										},
										{
											$lookup: {
												from: "Budget",
												localField: "_id",
												foreignField: "projectId",
												as: "budgets"
											}
										},
										{
											$unwind : "$budgets"
										},
										{
								     	$project: {
												_id: 0,
												projectId: "$_id",
												projectname: "$name",
												projectcode: "$code",
												year: "$budgets.year",
												month: "$budgets.month",
												budgetfrom: "$budgets.from",
												budgetto: "$budgets.to",
												budgetamount: "$budgets.amount",
												budgetdays: "$budgets.days",
												costdays: { $literal: null },
												costhours: { $literal: null },
												id: "$budgets._id"
								      }
										}
									], function(err, projects) {
										logger.info('customer ' + custId + ' projects : ' + JSON.stringify(projects, null, '\t'));
										var result = {customerId:custId,datatable:projects};
										budgetsresults.push(result);
										callbk();
									});

								});
							}, function(err) {
									if( err ) {
										logger.info('error: ' + JSON.stringify(err, null, '\t'));
										budgetsresults.push({error: err});
									}
									MongoPool.releaseConnection(db);
									callback(null, budgetsresults);
							});
						}
					};
		    }
			], function(err, data) {
		    	logger.info('data: ' + JSON.stringify(data, null, '\t'));
				var datatable = processData(data);
				jp.apply(datatable, '$[*].datatable[*].costdays', function(item) {
					logger.info('costdays: ' + item +
						'; typeof: ' + typeof item);
					if (item != null && typeof item == 'number') {
						var formattedItem = item.toString().replace(".", ",");
						logger.info('costdays formatted: ' + formattedItem);
						return formattedItem;
					}
				});
				jp.apply(datatable, '$[*].datatable[*].costhours', function(item) {
					logger.info('costhours: ' + item +
						'; typeof: ' + typeof item);
					if (item != null && typeof item == 'number') {
						var formattedItem = item.toString().replace(".", ",");
						logger.info('costhours formatted: ' + formattedItem);
						return formattedItem;
					}
				});
				jp.apply(datatable, '$[*].datatable[*].budgetamount', function(item) {
					logger.info('budgetamount: ' + item +
						'; typeof: ' + typeof item);
					if (item != null && typeof item == 'number') {
						var formattedItem = item.toString().replace(".", ",");
						logger.info('budgetamount formatted: ' + formattedItem);
						return formattedItem;
					}
				});
				jp.apply(datatable, '$[*].datatable[*].budgetdays', function(item) {
					logger.info('budgetdays: ' + item +
						'; typeof: ' + typeof item);
					if (item != null && typeof item == 'number') {
						var formattedItem = item.toString().replace(".", ",");
						logger.info('budgetdays formatted: ' + formattedItem);
						return formattedItem;
					}
				});
				res.json(datatable);
			});
			return res;
		} else {
			res.json(results);
			return res;
		}

	};
};
