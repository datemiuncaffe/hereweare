module.exports = function(options) {
	var mysql = require("mysql");
	var async = require("async");

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

	function getDataFromActiveProject(activeproject) {
		var budgets = [];
		var costs = [];
		if (activeproject != null) {
			if (activeproject.budgets != null) {
				budgets = activeproject.budgets;
			}
			if (activeproject.costs != null) {
				costs = activeproject.costs;
			}
		}

		// prepare data for table
		var datatable = [];
		if (budgets.length > 0 || costs.length > 0) {
			var zero2 = new Padder(2);
			var map = new Map();
			budgets.forEach(function(budget){
				var value = {
					id: budget.id,
					projectId: activeproject.id,
					projectname: activeproject.name,
					projectcode: activeproject.code,
					year: budget.year,
					month: budget.month,
					budgetfrom: budget.from,
					budgetto: budget.to,
					budgetamount: budget.amount,
					budgetdays: budget.days,
					costdays: null,
					costhours: null,
				};
				// var key = budget.year + '-' + zero2.pad((moment(budget.month, "MMMM").month() + 1));
				var key = activeproject.name + '-' + activeproject.id + '-' +
									budget.year + '-' + zero2.pad((months.indexOf(budget.month) + 1));
				map.set(key, value);
			});
			costs.forEach(function(cost){
				var key = activeproject.name + '-' + activeproject.id + '-' +
									cost.anno + '-' + zero2.pad(cost.mese);
				var value = {};
				if (map.has(key)) {
					value = map.get(key);
					value.id += '-' + cost.id + '-' + cost.mese;
					value.costdays = cost.giornateMese;
					value.costhours = cost.oreMese;
				} else {
					value = {
						id: '-' + cost.id + '-' + cost.mese,
						projectId: activeproject.id,
						projectname: activeproject.name,
						projectcode: activeproject.code,
						year: cost.anno,
						month: months[cost.mese - 1],
						budgetfrom: null,
						budgetto: null,
						budgetamount: null,
						budgetdays: null,
						costdays: cost.giornateMese,
						costhours: cost.oreMese
					};
					map.set(key, value);
				}
			});

			var keys = Array.from(map.keys());
			console.log('keys: ' + keys);
			var firstobj = map.get(keys[0]);
			for (var field in firstobj) {
				console.log('typeof field: ' + typeof firstobj[field]);
			}
			var sortedKeys = keys.sort();
			console.log('sortedKeys: ' + sortedKeys);
			sortedKeys.forEach(function(key){
				var value = map.get(key);
				console.log('m[' + key + '] = ' + JSON.stringify(value));
				datatable.push(value);
			});
		}
		return datatable;
	};

	function getDataTable(activeprojects) {
		console.log('activeprojects: ' + JSON.stringify(activeprojects, null, '\t'));
		var datatable = [];
		activeprojects.forEach(function(activeproject){
			var datafromproject = getDataFromActiveProject(activeproject);
			datatable = datatable.concat(datafromproject);
		});
		console.log('datatable: ' + JSON.stringify(datatable, null, '\t'));
		return datatable;
	};

	return function queryBudgetsCostsByCustomerId(req, res, next) {
		// First you need to create a connection to the db
		var con = mysql.createConnection({
			host : "192.168.88.158",
			user : "centos",
			database : "ehour"
		});

		// parse query string parameters
		var queryparams = req.query;
		console.log('queryparams: ' + JSON.stringify(queryparams));

		if (queryparams.customerId != null && queryparams.customerId > 0) {
			console.log('customerId: ' + queryparams.customerId);
			var query = 'select p.NAME as name, p.PROJECT_CODE as code, p.PROJECT_ID as id, p.CUSTOMER_ID as customerId ' +
									'FROM PROJECT p WHERE p.CUSTOMER_ID = \'' + queryparams.customerId + '\'';
			if (queryparams.onlyActive != null && queryparams.onlyActive == 'Y') {
				query += ' AND p.ACTIVE = \'y\';';
			} else {
				query += ';';
			}
			console.log('query: ' + query);
			con.query(query, function(err, activeprojects) {
				if (err) {
					con.end(function(err) {
					  console.log('ending connection queryBudgetsCostsByCustomerId not performed. err = ' + err);
					});
					throw err;
				}

				console.log('queryBudgetsCostsByCustomerId performed ...');
				console.log('activeprojects: ' + JSON.stringify(activeprojects, null, '\t'));

				var datatable = [];
				async.each(activeprojects, function(activeproject, callback) {
					con.query('select t.ASSIGNMENT_ID as id, year(ENTRY_DATE) as anno, month(ENTRY_DATE) as mese, ' +
										'c.NAME as nomeCliente, p.PROJECT_CODE as codiceProgetto, p.NAME as nomeProgetto, ' +
										'round(sum(HOURS)/8,2) as giornateMese, sum(HOURS) as oreMese ' +
										'from TIMESHEET_ENTRY t join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID ' +
										'join PROJECT p on a.PROJECT_ID = p.PROJECT_ID join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID ' +
										'group by anno, mese, c.CUSTOMER_ID, p.PROJECT_ID having p.PROJECT_ID = \''	+
										activeproject.id + '\' order by anno, mese;',
						function(err, costs) {
							if (err) {
								con.end(function(err) {
									console.log('ending connection queryCosts not performed. err = ' + err);
								});
								throw err;
							}

							console.log('queryCosts performed ...');
							console.log('activeproject' + activeproject.id + ' costs : ' + JSON.stringify(costs, null, '\t'));
							activeproject.costs = costs;
							callback();
						});
				}, function(err) {
				    if( err ) {
				      console.log('error: ' + JSON.stringify(err, null, '\t'));
							res.json({error: err});
				    } else {
							console.log('activeprojects: ' + JSON.stringify(activeprojects, null, '\t'));
							datatable = getDataTable(activeprojects);
							res.json(datatable);
				    }
				});

				con.end(function(err) {
					console.log('ending connection after queryBudgetsCostsByCustomerId. err = ' + err);
				});

			});
			return res;
		} else {
			res.json([]);
			return res;
		}

	};
};
