angular
	.module("app")
	.controller("DettaglioProgettoController", ['$scope', '$q', 'crud', '$window', '$log',
					function($scope, $q, crud, $window, $log) {
		var now = moment();
		var currentYear = now.year();
		var currentMonth = now.month();
		var months = ['Gennaio','Febbraio','Marzo','Aprile','Maggio',
						  'Giugno','Luglio','Agosto','Settembre','Ottobre',
						  'Novembre','Dicembre'];

		$scope.customers = null;
		$scope.selectedCustomer = null;
		$scope.selectedProject = null;

		$q.all([
			crud.GET.EHOUR.getCustomers()
		]).then(function(data) {
			var customers = data[0];
			$scope.customers = customers;
			$scope.selectedCustomer = customers[0];
			$scope.searchProjects($scope.selectedCustomer);
		});

		/* loading project data */
		function loadingProject(selectedProject) {
			console.log('selectedProject: ' + JSON.stringify(selectedProject));
			if (selectedProject != null &&
				selectedProject.id != null && selectedProject.id > 0) {
				console.log('Project id: ' + selectedProject.id);

				// perform queries
				$q.all([
					crud.GET.LOCAL.getBudgets({id:selectedProject.id})
							.then(function(res){
								console.log('success res: ' + JSON.stringify(res, null, '\t'));
								return res;
							}, function(error){
								var res = {
									status: error.status,
									statusText: error.statusText
								}
								console.log('error: ' + JSON.stringify(res, null, '\t'));
								return res;
							}),
					crud.GET.EHOUR.getCosts({projectId: selectedProject.id})
							.then(function(res){
								console.log('success res: ' + JSON.stringify(res, null, '\t'));
								return res;
							}, function(res){
								var res = {
									status: error.status,
									statusText: error.statusText
								}
								console.log('error: ' + JSON.stringify(res, null, '\t'));
								return res;
							})
				]).then(function(data) {
					console.log('data: ' + JSON.stringify(data, null, '\t'));
					showData(data);
				}, function(error){
					console.log('error: ' + JSON.stringify(error, null, '\t'));
				});
			}
		};

		function showData(data) {
			var budgets = [];
			if (data[0] != null) {
				if (data[0].budgettot != null && data[0].budgettot > 0) {
					$scope.selectedProject.budgettot = parseInt(data[0].budgettot);
				}
				if (data[0].daystot != null && data[0].daystot > 0) {
					$scope.selectedProject.daystot = parseInt(data[0].daystot);
				}
				if (data[0].from != null && data[0].from.length > 0) {
					$scope.selectedProject.from = data[0].from;
				}
				if (data[0].to != null && data[0].to.length > 0) {
					$scope.selectedProject.to = data[0].to;
				}
				if (data[0].budgets != null) {
					budgets = data[0].budgets;
					console.log('budgets: ' + JSON.stringify(budgets, null, '\t'));
				}
			}
			var costs = [];
			if (data[1].length > 0) {
				costs = data[1];
				console.log('costs: ' + JSON.stringify(costs, null, '\t'));
			}

			// prepare data for table
			var datatable = [];
			if (budgets.length > 0 || costs.length > 0) {
						var zero2 = new Padder(2);
						var map = new Map();
						budgets.forEach(function(budget){
							var value = {
								id: budget.id,
								year: budget.year,
								month: budget.month,
								budgetfrom: budget.from,
								budgetto: budget.to,
								budgetamount: budget.amount,
								budgetdays: budget.days,
								costdays: null
							};
							var key = budget.year + '-' +
								zero2.pad((months.indexOf(budget.month) + 1));
							map.set(key, value);
						});
						costs.forEach(function(cost){
							var key = cost.anno + '-' + zero2.pad(cost.mese);
							var value = {};
							if (map.has(key)) {
								value = map.get(key);
								value.id += '-' + (cost.id + cost.mese);
								value.costdays = cost.giornateMese;
							} else {
								value = {
									id: '-' + (cost.id + cost.mese),
									year: cost.anno,
									month: months[cost.mese - 1],
									budgetfrom: null,
									budgetto: null,
									budgetamount: null,
									budgetdays: null,
									costdays: cost.giornateMese
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

			// render the table
			tabulate(datatable,
				['year', 'month', 'budgetfrom', 'budgetto', 'budgetamount', 'budgetdays', 'costdays']);

		}

		var table = d3.select("form[name=estimateForm] div.search_results").append("table"),
			thead = table.append("thead"),
			tbody = table.append("tbody");

		var headers = ['ANNO', 'MESE', 'DETTAGLIO \r\n DA', 'DETTAGLIO \r\n A', 'BUDGET MENSILE', 'GIORNATE PREVISTE', 'GIORNATE EROGATE'],
			superheaders = ['', '', 'PREVENTIVO', 'CONSUNTIVO'];

		// append the superheader row
		thead.append("tr")
				.attr('class', 'tablesuperheaders')
				.selectAll("th")
				.data([
					{header: superheaders[0], colspan: 1, border: 'none'},
					{header: superheaders[1], colspan: 1, border: 'none'},
					{header: superheaders[2], colspan: 4, border: '1px solid black'},
					{header: superheaders[3], colspan: 1, border: '1px solid black'}
				])
				.enter()
				.append("th")
				.attr('colspan', function(d) {
					return d.colspan;
				})
				.style('border', function(d) {
					return d.border;
				})
				.text(function(d) {
					return d.header;
				});

		// append the header row
		thead.append("tr")
				.attr('class', 'tableheaders')
				.selectAll("th")
				.data(headers)
				.enter()
				.append("th")
						.text(function(column) { return column; });

		// append filter cells
		thead.append("tr")
				.attr('class', 'tablefilters')
				.selectAll("th")
				.data(headers)
				.enter()
				.append("th")
				.append('input')
				.attr('size', 8)
				.attr('type', 'text');

		// The table generation function
		function tabulate(data, columns) {
			setFilters(data, columns);
			var filtereddata = filterTable(data, columns);
			renderTable(filtereddata, columns);
			return table;
		}

		function setFilters(data, columns) {
			var tablefilters = d3.select("tr.tablefilters")
					.selectAll("input")
					.attr("value", function(d, i) {
						switch (d) {
							case 'ANNO':
								return currentYear;
								break;
							case 'MESE':
								return months[currentMonth];
								break;
							default:
								return '';
						}
					})
					.on("input", function(d, i) {
						var filtereddata = filterTable(data, columns);
						renderTable(filtereddata, columns);
					});
		}

		// add totals row
		function addTotalsRow(data) {
			tbody.select("tr.spacer").remove();
			tbody.select("tr.totalsrow").remove();

			console.log("data: " + JSON.stringify(data));
			var totalsrowData = [];
			var totals = {
				budgetdays: 0,
				costdays: 0
			};
			if (data.length > 0) {
				totals = data.reduce(function(totals, datum){
					if (datum.budgetdays) {
						totals.budgetdays = totals.budgetdays + datum.budgetdays;
					}
					if (datum.costdays) {
						totals.costdays = totals.costdays +
							parseFloat(datum.costdays.replace(",", "."));
					}
					return totals;
				}, totals);
				totals.costdays = totals.costdays.toFixed(2).replace(".", ",");
				console.log("totals = " + JSON.stringify(totals));
				totalsrowData.push({
					budgetdays: totals.budgetdays,
					costdays: totals.costdays
				});

				tbody.append("tr")
					.attr('class', 'spacer')
					.append("td")
					.html('&nbsp;')
					.attr('colspan', 7);

				tbody.append("tr")
					.attr('class', 'totalsrow')
					.data(totalsrowData)
					.selectAll("td")
					.data(function(row) {
						console.log('row: ' + JSON.stringify(row));
						return [
							{value: 'TOTALI GIORNATE', colspan: 5, border: '1px solid black'},
							{value: row['budgetdays'], colspan: 1, border: '1px solid black'},
							{value: row['costdays'], colspan: 1, border: '1px solid black'}
						]
					})
					.enter()
					.append("td")
					.attr('colspan', function(d) {
						return d.colspan;
					})
					.style('border', function(d) {
						return d.border;
					})
					.text(function(d) {
						return d.value;
					});
			}
		}

		function renderTable(data, columns) {
			var rows = tbody.selectAll("tr.datarow").data(data,
				function(d) {
					return d.id;
				});

			// create a row for each object in the data
			var rowsEnter = rows.enter()
				//.insert("tr");
				.append("tr")
				.attr('class', 'datarow');
//			.append("tr");

			// create a cell in each row for each column
			var cells = rowsEnter.selectAll("td")
				.data(function(row) {
						return columns.map(function(column) {
								return {column: column, value: row[column]};
						});
				})
				.enter()
				.append("td")
//			    .attr("style", "font-family: Courier") // sets the font style
				.html(function(d) { return d.value });

			// var rowsUpdate = rows.attr("style", "font-family: Courier"); // sets the font style

			var rowsExit = rows.exit().remove();

			addTotalsRow(data);
		}

		function filterTable(rows, columns) {
			var filtervalues = [];

			// get filter values
			var tablefilters = d3.select("tr.tablefilters").selectAll("th");
			tablefilters.each(function(p, i) {
				var inputfilter = d3.select(this).select("input");
				filtervalues.push(inputfilter.property("value"));
			});
			console.log('filtervalues: ' + filtervalues);

			var filteredrows = [];
			rows.forEach(function(row){
				console.log('row: ' + JSON.stringify(row));

				var failures = 0;
				columns.forEach(function(column, i){
					if (row[column] != null) {
						var regExp = new RegExp(filtervalues[i], 'gi');
						var res = regExp.exec(row[column].toString());
						console.log(column + '-' + row[column].toString() + '; filtervalue: ' + filtervalues[i] + '; res: ' + res);
						if (res == null) {
							failures++;
						}
					} else {
						console.log('filtervalue: ' + filtervalues[i]);
						if (filtervalues[i] != null && filtervalues[i].length > 0) {
							failures++;
						}
					}
				});

				console.log('failures = ' + failures);
				if (failures == 0) {
					filteredrows.push(row);
				}

			});
			console.log('filteredrows: ' + JSON.stringify(filteredrows, null, '\t'));
			return filteredrows;
		}

		$scope.searchProjects = function(selectedCustomer) {
			console.log('selectedCustomer: ' + JSON.stringify(selectedCustomer, null, '\t'));
			if (selectedCustomer != null && selectedCustomer.id != null && selectedCustomer.id > 0) {
				console.log('searching for selectedCustomer id = ' + selectedCustomer.id);
				crud.GET.EHOUR.getProjectsByCustomerId({ customerId: selectedCustomer.id }).then(function(data) {
					console.log('data: ' + JSON.stringify(data));
					$scope.selectedCustomer.projects = data;
					$scope.selectedProject = data[0];
					loadingProject($scope.selectedProject);
				});
			}
		};

		$scope.onCustomerChange = function(selectedCustomer) {
			if (selectedCustomer != null) {
				$scope.searchProjects(selectedCustomer);
			}
	  };

		$scope.onProjectChange = function(selectedProject) {
			if (selectedProject != null) {
				loadingProject(selectedProject);
			}
		};

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
		}

	}]);
