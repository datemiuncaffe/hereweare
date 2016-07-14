angular
	.module("app")
	.directive('onLastRepeat', function() {
		return function(scope, element, attrs) {
			if (scope.$last) {
				setTimeout(function() {
						scope.$emit('onRepeatLast', element, attrs);
				}, 1);
			}
		};
	})
	.controller("ActiveProjectsController",
							['$scope', '$q', 'crud', '$log',
							function($scope, $q, crud, $log) {
		var now = moment();
		var currentmonth = now.month();
		var months = ['Gennaio','Febbraio','Marzo','Aprile','Maggio',
									'Giugno','Luglio','Agosto','Settembre','Ottobre',
									'Novembre','Dicembre'];
		$scope.customers = null;

    $q.all([
		  crud.getCustomers()
		])
		.then(function(data) {
			var customers = data[0];
			$scope.customers = customers;
		});

		$scope.$on('onRepeatLast', function(event, element, attrs){
			$(element).parent()
								.find("div.customer")
								.each(function() {
									var element = $(this);
									var customerId = $(this).attr("data-customer-id");
									console.log('customerId = ' + customerId);
									// if (customerId == '22') {
									// 	getActiveProjectsByCustomerId(customerId, element, showData);
									// }
									getActiveProjectsByCustomerId(customerId, element, showData);
								});
		});

		function getActiveProjectsByCustomerId(id, element, cb) {
			if (id != null && id > 0) {
				crud.getBudgetsCostsByCustomerId({ customerId: id, onlyActive: 'Y' })
						.then(function(datatable) {
					console.log('datatable: ' + JSON.stringify(datatable));
					cb(id, element, datatable);
				});
			}
		};

		function showData(id, element, datatable) {
			var table = insertTable(id, element);
			// render the table
			tabulate(table, datatable,
					['projectname', 'projectcode', 'year', 'month', 'budgetdays', 'costdays', 'costhours']);
		};

		function insertTable(id, element) {
			var table = d3.select("section[id=activeprojects] div[data-customer-id='" + id + "'] div.activeprojects")
										.append("table"),
				thead = table.append("thead"),
				tbody = table.append("tbody");

			var headers = ['NOME PROGETTO', 'CODICE PROGETTO', 'ANNO', 'MESE', 'GIORNATE PREVISTE', 'GIORNATE EROGATE', 'ORE EROGATE'],
					superheaders = ['', 'PREVENTIVO', 'CONSUNTIVO'];

			// append the superheader row
			thead.append("tr")
					.attr('class', 'tablesuperheaders')
					.selectAll("th")
					.data([
						{header: superheaders[0], colspan: 4, border: 'none'},
						{header: superheaders[1], colspan: 1, border: '1px solid black'},
						{header: superheaders[2], colspan: 2, border: '1px solid black'}
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

			return table;
		};

		// The table generation function
		function tabulate(table, data, columns) {
			setFilters(table, data, columns);
			var filtereddata = filterTable(table, data, columns);
			renderTable(table, filtereddata, columns);
		};

		function setFilters(table, data, columns) {
			console.log('filters length: ' + table.select("tr.tablefilters").length);
			var tablefilters = table.select("tr.tablefilters")
					.selectAll("input")
					.attr("value", function(d, i) {
						if (d == 'ANNO') {
							return '2016';
						}
						if (d == 'MESE') {
							return months[currentmonth];
						}
						return '';
					})
					.on("input", function(d, i) {
						var filtereddata = filterTable(table, data, columns);
						renderTable(table, filtereddata, columns);
					});
		};

		function renderTable(table, data, columns) {
			var rows = table.select("tbody").selectAll("tr").data(data,
				function(d) {
					return d.id;
				});

			// create a row for each object in the data
			var rowsEnter = rows.enter()
				.insert("tr");
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
		};

		function filterTable(table, rows, columns) {
			var filtervalues = [];

			// get filter values
			var tablefilters = table.select("tr.tablefilters").selectAll("th");
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
						var regExp = new RegExp(filtervalues[i], 'g');
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
		};

	}]);
