module.exports = function(options) {
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var MongoPool = require('./../../lib/mongo-pool').pool();
	var async = require("async");
	var moment = require('moment');
	// var MongoClient = require('mongodb').MongoClient;

	var months = ['Gennaio','Febbraio','Marzo','Aprile','Maggio',
								'Giugno','Luglio','Agosto','Settembre','Ottobre',
								'Novembre','Dicembre'];

	// function Padder(len, pad) {
	// 	if (len === undefined) {
	// 		len = 1;
	// 	} else if (pad === undefined) {
	// 		pad = '0';
	// 	}
	//
	// 	var pads = '';
	// 	while (pads.length < len) {
	// 		pads += pad;
	// 	}
	//
	// 	this.pad = function(what) {
	// 		var s = what.toString();
	// 		return pads.substring(0, pads.length - s.length) + s;
	// 	};
	// };

	// function getDataFromActiveProject(activeproject) {
	// 	var budgets = [];
	// 	var costs = [];
	// 	if (activeproject != null) {
	// 		if (activeproject.budgets != null) {
	// 			budgets = activeproject.budgets;
	// 		}
	// 		if (activeproject.costs != null) {
	// 			costs = activeproject.costs;
	// 		}
	// 	}
	//
	// 	// prepare data for table
	// 	var datatable = [];
	// 	if (budgets.length > 0 || costs.length > 0) {
	// 		var zero2 = new Padder(2);
	// 		var map = new Map();
	// 		budgets.forEach(function(budget){
	// 			var value = {
	// 				id: budget.id,
	// 				projectId: activeproject.id,
	// 				projectname: activeproject.name,
	// 				projectcode: activeproject.code,
	// 				year: budget.year,
	// 				month: budget.month,
	// 				budgetfrom: budget.from,
	// 				budgetto: budget.to,
	// 				budgetamount: budget.amount,
	// 				budgetdays: budget.days,
	// 				costdays: null,
	// 				costhours: null,
	// 			};
	// 			// var key = budget.year + '-' + zero2.pad((moment(budget.month, "MMMM").month() + 1));
	// 			var key = activeproject.name + '-' + activeproject.id + '-' +
	// 								budget.year + '-' + zero2.pad((months.indexOf(budget.month) + 1));
	// 			map.set(key, value);
	// 		});
	// 		costs.forEach(function(cost){
	// 			var key = activeproject.name + '-' + activeproject.id + '-' +
	// 								cost.anno + '-' + zero2.pad(cost.mese);
	// 			var value = {};
	// 			if (map.has(key)) {
	// 				value = map.get(key);
	// 				value.id += '-' + cost.id + '-' + cost.mese;
	// 				value.costdays = cost.giornateMese;
	// 				value.costhours = cost.oreMese;
	// 			} else {
	// 				value = {
	// 					id: '-' + cost.id + '-' + cost.mese,
	// 					projectId: activeproject.id,
	// 					projectname: activeproject.name,
	// 					projectcode: activeproject.code,
	// 					year: cost.anno,
	// 					month: months[cost.mese - 1],
	// 					budgetfrom: null,
	// 					budgetto: null,
	// 					budgetamount: null,
	// 					budgetdays: null,
	// 					costdays: cost.giornateMese,
	// 					costhours: cost.oreMese
	// 				};
	// 				map.set(key, value);
	// 			}
	// 		});
	//
	// 		var keys = Array.from(map.keys());
	// 		console.log('keys: ' + keys);
	// 		var firstobj = map.get(keys[0]);
	// 		for (var field in firstobj) {
	// 			console.log('typeof field: ' + typeof firstobj[field]);
	// 		}
	// 		var sortedKeys = keys.sort();
	// 		console.log('sortedKeys: ' + sortedKeys);
	// 		sortedKeys.forEach(function(key){
	// 			var value = map.get(key);
	// 			console.log('m[' + key + '] = ' + JSON.stringify(value));
	// 			datatable.push(value);
	// 		});
	// 	}
	// 	return datatable;
	// };

	// function getDataTable(activeprojects) {
	// 	console.log('activeprojects: ' + JSON.stringify(activeprojects, null, '\t'));
	// 	var datatable = [];
	// 	activeprojects.forEach(function(activeproject){
	// 		var datafromproject = getDataFromActiveProject(activeproject);
	// 		datatable = datatable.concat(datafromproject);
	// 	});
	// 	console.log('datatable: ' + JSON.stringify(datatable, null, '\t'));
	// 	return datatable;
	// };

	function getDataTable(data) {
		data.forEach(function(datum){
			datum.id = '-' + datum.projectId + '-' + datum.year + '-' + datum.month;
			datum.month = months[datum.month - 1];
		});
		return data;
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
				var datatable = getDataTable(data);
				cb(datatable);
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
			], function(err, results) {
		    console.log('results: ' + JSON.stringify(results, null, '\t'));

				res.json(results[0]);
			});
			return res;
		} else {
			res.json(results);
			return res;
		}

	};
};
