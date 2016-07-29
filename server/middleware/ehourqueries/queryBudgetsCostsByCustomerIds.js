module.exports = function(options) {
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var MongoPool = require('./../../lib/mongo-pool').pool();
	var async = require("async");
	var moment = require('moment');

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

		dataBudgets.forEach(function(customerBudgets) {
			var customerId = customerBudgets.customerId;
			console.log('customerId: ' + customerId);
			var budgets = customerBudgets.datatable;
			console.log('budgets: ' + JSON.stringify(budgets, null, '\t'));

			var customerCosts = dataCosts.filter(function(dataCost) {
				return (dataCost.customerId == customerId);
			});
			var costs = customerCosts[0].datatable;
			console.log('costs: ' + JSON.stringify(costs, null, '\t'));

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
					console.log('corrbudget: ' + JSON.stringify(corrbudget, null, '\t'));
					if (corrbudget.length == 1) {
						corrbudget[0].id += '-' + cost.projectId + '-' + cost.year + '-' + zero2.pad(cost.month);
						corrbudget[0].costdays = cost.costdays;
						corrbudget[0].costhours = cost.costhours;
						console.log('corrbudget MODIFIED: ' + JSON.stringify(corrbudget, null, '\t'));
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
				console.log('result: ' + JSON.stringify(result, null, '\t'));
				results.push(result);
			}
		});

		console.log("results: " + JSON.stringify(results, null, '\t'));
		return results;
	};

	function getDataByCustomerId(connection, customerId, projectGroup, cb) {
		if (customerId != null && customerId > 0) {
			console.log('customerId: ' + customerId);

			var now = moment();
			var lowdatelimit = now.subtract(2, 'months').format('YYYY-MM-DD');
			console.log('lowdatelimit for active and new projects: ' + lowdatelimit);

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

			console.log('query: ' + query);
			console.log('connection: ' + connection + '; query: ' + query);

			connection.query(query, function(err, data) {
				if (err) {
					console.log('err: ' + JSON.stringify(err));
					throw err;
				}

				console.log('queryBudgetsCostsByCustomerId performed ...');
				console.log('data: ' + JSON.stringify(data, null, '\t'));
				cb(data);
			});

		} else {
			cb([]);
		}
	};

	return function queryBudgetsCostsByCustomerIds(req, res, next) {
		// parse query string parameters
		var queryparams = req.query;
		console.log('queryparams: ' + JSON.stringify(queryparams));

		if (queryparams.customerIds != null && queryparams.customerIds.length > 0) {
			var customerIds = queryparams.customerIds.split(',');
			console.log('customerIds: ' + JSON.stringify(customerIds));

			async.parallel([
		    function(callback) {
					MysqlPool.getConnection(getData, customerIds);
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
									console.log('error: ' + JSON.stringify(err, null, '\t'));
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
									console.log('customer ' + custId + ' projects : ' + JSON.stringify(projects, null, '\t'));
									var result = {customerId:custId,datatable:projects};
									budgetsresults.push(result);
									callbk();
								});

							});
						}, function(err) {
								if( err ) {
									console.log('error: ' + JSON.stringify(err, null, '\t'));
									budgetsresults.push({error: err});
								}
								MongoPool.releaseConnection(db);
								callback(null, budgetsresults);
						});
					};
		    }
			], function(err, data) {
		    console.log('data: ' + JSON.stringify(data, null, '\t'));
				var datatable = processData(data);
				res.json(datatable);
			});
			return res;
		} else {
			res.json(results);
			return res;
		}

	};
};
