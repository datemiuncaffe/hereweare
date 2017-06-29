angular
	.module("app")
	.controller("ProjectModifyController",
				['$scope', '$resource', '$q', '$stateParams', 'crud', 'internalCosts',
		    function($scope, $resource, $q, $stateParams, crud, internalCosts) {

			/* entities */
	    $scope.customer = {
	    	name: null
	    };

	    $scope.project = {
	    	name: null,
	    	code: null,
	    	from: null,
	    	to: null,
	    	budgettot: null,
	    	daystot: null,
	    	customerId: null,
				team: {
					label: "Project team",
					allowedTypes: ["developer", "projectOwner"],
					max: 100,
					members: []
				},
	    	budgets: []
	    };
			var budgetsStatus = [];

			$scope.employeesWithCosts = {
				label: "Sensei developers",
				allowedTypes: ["developer", "projectOwner"],
				max: 100,
				items: []
			};			
	    /* end entities */

			/* datepickers */
			var datepickerfrom = new Pikaday({
				field : document.getElementById('datepickerfrom'),
				firstDay : 1,
				minDate : new Date(2000, 0, 1),
				maxDate : new Date(2020, 12, 31),
				yearRange : [ 2000, 2020 ]
				// defaultDate : moment($scope.project.from, "YYYY-MM-DD").toDate()
			});
			var datepickerto = new Pikaday({
				field : document.getElementById('datepickerto'),
				firstDay : 1,
				minDate : new Date(2000, 0, 1),
				maxDate : new Date(2020, 12, 31),
				yearRange : [ 2000, 2020 ],
				// setDefaultDate : true,
				// defaultDate : moment($scope.project.to, "YYYY-MM-DD").toDate(),
				// startRange : moment($scope.project.from, "YYYY-MM-DD").toDate(),
				// startRange : new Date(2016, 5, 10),
				// endRange : moment($scope.project.to, "YYYY-MM-DD").toDate(),
				onSelect: function(bdays) {
						console.log(this.getMoment().format('Do MMMM YYYY'));
						// this.gotoDate(new Date(2016, 1));
						// var years = Array.from(bdays.keys());
						// console.log('years: ' + years);
				},
				onOpen: function() {
					console.log(this._o.defaultDate);
				}
			});
			$scope.datepickerfrom = datepickerfrom;
			$scope.datepickerto = datepickerto;
			/* end datepickers */

			console.log('$stateParams.customerId: ' + $stateParams.customerId);
			console.log('$stateParams.customerName: ' + $stateParams.customerName);

			if ($stateParams.customerId != null && $stateParams.customerId > 0) {
				$scope.customer.id = parseInt($stateParams.customerId);
			}
			if ($stateParams.customerName != null && $stateParams.customerName.length > 0) {
				$scope.customer.name = $stateParams.customerName;
			}

			if ($stateParams.projectId != null && $stateParams.projectId > 0) {
				$scope.project.id = parseInt($stateParams.projectId);
			}
			if ($stateParams.projectName != null && $stateParams.projectName.length > 0) {
				$scope.project.name = $stateParams.projectName;
			}
			if ($stateParams.projectCode != null && $stateParams.projectCode.length > 0) {
				$scope.project.code = $stateParams.projectCode;
			}

			/* loading data */
	    if ($scope.project.id != null && $scope.project.id > 0) {
				loadData($scope.project.id);
	    }
	    /* end loading data */

			function getEmployeeCosts() {
		    var deferred = $q.defer();

				internalCosts.getEmployeeCosts(null, function(err, data) {
					if (err) {
						deferred.reject('error: ' + err);
					} else {
						deferred.resolve(data);
					}
				});

		    return deferred.promise;
			};

			function loadData(project_id) {
				var projectId = {
					id: project_id
				};
	    	// perform queries
	    	$q.all([
					crud.GET.LOCAL.getBudgets(projectId)
							.then(function(res){
								//console.log('success res: ' + JSON.stringify(res, null, '\t'));
								return res;
							}, function(error){
								var res = {
									status: error.status,
									statusText: error.statusText
								}
								console.log('error: ' + JSON.stringify(res, null, '\t'));
								return res;
							}),
					getEmployeeCosts()
							.then(function(res){
								//console.log('success res: ' + JSON.stringify(res, null, '\t'));
								return res;
							}, function(error){
								var res = {
									error: JSON.stringify(error, null, '\t')
								}
								console.log('error: ' + JSON.stringify(res, null, '\t'));
								return res;
							})
				])
				.then(function(data) {
					console.log('data: ' + JSON.stringify(data, null, '\t'));
					showData(data);
				}, function(error){
					console.log('error: ' + JSON.stringify(error, null, '\t'));
				});
			};

			function showData(data) {
				if (data[0] != null) {
					if (data[0].budgettot != null && data[0].budgettot > 0) {
						$scope.project.budgettot = data[0].budgettot;
					}
					if (data[0].daystot != null && data[0].daystot > 0) {
						$scope.project.daystot = data[0].daystot;
					}
					if (data[0].from != null && data[0].from.length > 0) {
						$scope.project.from = data[0].from;
						// set datepickers default dates
						datepickerfrom.setDate(moment($scope.project.from, "DD/MM/YYYY").toDate());
					}
					if (data[0].to != null && data[0].to.length > 0) {
						$scope.project.to = data[0].to;
						// set datepickers default dates
						datepickerto.setDate(moment($scope.project.to, "DD/MM/YYYY").toDate());
					}
					if (data[0].budgets != null) {
						budgetsStatus = data[0].budgets;
						$scope.project.budgets = data[0].budgets;
						// set budgets days
						setBudgetsDays();
						console.log('budgets: ' + JSON.stringify($scope.project.budgets, null, '\t'));
					}
				}
				if (data[1] && data[1].internalCosts &&
						data[1].internalCosts.length > 0) {
					//$scope.employeesWithCosts.max = data[1].internalCosts.length;
					$scope.employeesWithCosts.max = 4;
					data[1].internalCosts.forEach(function(internalCost, index) {
						var item = {};
						item.id = index;
						if (internalCost.lastName &&
								internalCost.lastName.length > 0 &&
								internalCost.firstName &&
								internalCost.firstName.length > 0) {
							item.name = internalCost.lastName + '-' +
													internalCost.firstName;
						}
						if (internalCost.internalCost) {
							item.internalCost = internalCost.internalCost;
						}
						item.type = "developer";
						$scope.employeesWithCosts.items.push(item);
					});
				}
			};

			// set budgets days
			function setBudgetsDays() {
				var zero2 = new Padder(2);
				var budgetsdays = [];
				$scope.project.budgets.forEach(function(budget){
					if (budget.businessdays != null) {
						var bdays = JSON.parse(budget.businessdays);
						bdays.forEach(function(bday){
							var budgetmonth = datepickerto._o.i18n.months.indexOf(budget.month);
							var formattedDate = zero2.pad(bday) + '/' + zero2.pad(budgetmonth + 1) + "/" + budget.year;
							console.log('formattedDate: ' + formattedDate);
							budgetsdays.push(moment(formattedDate, "DD/MM/YYYY").toDate());
						});
					}
				});
				datepickerfrom.setBudgetsDays(budgetsdays);
				datepickerto.setBudgetsDays(budgetsdays);
			};

			var holidays = [
				{date: "XXXX-01-01",description: "capodanno"},
				{date: "XXXX-01-06",description: "epifania"},
				{date: "XXXX-04-25",description: "liberazione"},
				{date: "XXXX-05-01",description: "festa del lavoro"},
				{date: "XXXX-06-02",description: "festa della repubblica"},
				{date: "XXXX-08-15",description: "ferragosto"},
				{date: "XXXX-11-01",description: "ognissanti"},
				{date: "XXXX-11-02",description: "festa dei morti"},
				{date: "XXXX-12-08",description: "immacolata"},
				{date: "XXXX-12-25",description: "natale"},
				{date: "XXXX-12-26",description: "santo stefano"}
			];

			function isholiday(month, dayofmonth) {
				var isholiday = false;
				var zero2 = new Padder(2);
				var date = "XXXX-" + zero2.pad(month + 1) + "-" + zero2.pad(dayofmonth);
				isholiday = holidays.map(function(o) {
					return o.date;
				}).includes(date);
				console.log("date " + date + " isholiday " + isholiday);
				return isholiday;
			}

			function getBusinessDays(from, to) {
				var daystart = from.clone();
				var dayend = to.clone();

				var yearsmap = new Map();
				var monthsmap = null;
				var weeksmap = null;
				var year = 0;
				var month = 0;
				var week = 0;
				var days = [];
				while(dayend.diff(daystart, 'days') >= 0) {
					year = daystart.year();
					console.log('year: ' + year);
					if (yearsmap.has(year)) {
						monthsmap = yearsmap.get(year);
						month = daystart.month();
						console.log('month: ' + month);
						if (monthsmap.has(month)) {
							weeksmap = monthsmap.get(month);
							week = daystart.week();
							if (weeksmap.has(week)) {
								days = weeksmap.get(week);
								if (daystart.day() != 0 && daystart.day() != 6 &&
										!isholiday(month, daystart.date())) {
									days.push(daystart.date());
								}
								console.log('days: ' + days);
							} else {
								console.log('new week of month: ' + month);
								days = [];
								if (daystart.day() != 0 && daystart.day() != 6 &&
										!isholiday(month, daystart.date())) {
									days.push(daystart.date());
								}
								weeksmap.set(week, days);
								console.log('days: ' + days);
							}
						} else {
							console.log('new month');
							weeksmap = new Map();
							week = daystart.week();
							days = [];
							if (daystart.day() != 0 && daystart.day() != 6 &&
									!isholiday(month, daystart.date())) {
								days.push(daystart.date());
							}
							weeksmap.set(week, days);
							monthsmap.set(month, weeksmap);
							console.log('days: ' + days);
						}
					} else {
						console.log('new year');
						monthsmap = new Map();
						weeksmap = new Map();
						month = daystart.month();
						week = daystart.week();
						days = [];
						if (daystart.day() != 0 && daystart.day() != 6 &&
								!isholiday(month, daystart.date())) {
							days.push(daystart.date());
						}
						weeksmap.set(week, days);
						monthsmap.set(month, weeksmap);
						yearsmap.set(year, monthsmap);
					}
					daystart.add(1, 'day');
				}
				console.log('yearsmap size: ' + yearsmap.size);

				return yearsmap;
			};

			function getDaysTot(yearsmap) {
				var daysTot = 0;
				var years = Array.from(yearsmap.keys());
				console.log('years: ' + years);
				years.forEach(function(year){
					var monthsmap = yearsmap.get(year);
					var months = Array.from(monthsmap.keys());
					console.log('months: ' + months);
					months.forEach(function(month){
						var weeksmap = monthsmap.get(month);
						var weeks = Array.from(weeksmap.keys());
						weeks.forEach(function(week){
							var days = weeksmap.get(week);
							console.log('m[' + year + '-' + month + '-' + week + '] = ' + JSON.stringify(days));
							daysTot += days.length;
						});
					});
				});
				return daysTot;
			};

	    $scope.getBudgets = function(budgettot, selectedfrom, selectedto) {
	    	if (budgettot == null) {
	    		throw 'ERR: il budget totale non è stato inserito';
	    	}
	    	console.log('budgettot: ' + budgettot);

	    	if (selectedfrom == null) {
	    		throw 'ERR: inserire la data iniziale';
	    	}
	    	if (selectedto == null) {
	    		throw 'ERR: inserire la data finale';
	    	}

	    	var from = moment(selectedfrom, "DD/MM/YYYY");
	    	var to = moment(selectedto, "DD/MM/YYYY");
	    	console.log('diff in months: ' + to.diff(from, 'months'));

				console.log('budgetsStatus: ' +
					JSON.stringify(budgetsStatus, null, '\t'));
	    	if (from.isBefore(to)) {
					console.log('budgets: ' +
						JSON.stringify($scope.project.budgets, null, '\t'));
					$scope.project.budgets =
						JSON.parse(JSON.stringify(budgetsStatus));

					var zero2 = new Padder(2);
					var bdays = getBusinessDays(from, to);
					var daystot = getDaysTot(bdays);
					$scope.project.daystot = daystot;
					console.log('daystot: ' + $scope.project.daystot);

					var budgetCount = 0;
					var years = Array.from(bdays.keys());
					years.forEach(function(budgetyear){
						var monthsmap = bdays.get(budgetyear);
						var months = Array.from(monthsmap.keys());
						months.forEach(function(budgetmonth){
							var weeksmap = monthsmap.get(budgetmonth);
							var weeks = Array.from(weeksmap.keys());
							var firstWeek = weeks[0];
							var lastWeek = weeks[weeks.length - 1];

							var firstDay = null;
							if (weeksmap.get(firstWeek).length > 0) {
								firstDay = weeksmap.get(firstWeek)[0];
							} else {
								firstDay = weeksmap.get(firstWeek + 1)[0];
							}

							var lastDay = null;
							if (weeksmap.get(lastWeek).length > 0) {
								lastDay = weeksmap.get(lastWeek)[weeksmap.get(lastWeek).length - 1];
							} else {
								lastDay = weeksmap.get(lastWeek - 1)[weeksmap.get(lastWeek - 1).length - 1];
							}

							var monthdays = 0;
							var businessdays = [];
							var businessdaysnum = 0;
							var windows = [];
							weeks.forEach(function(week){
								var days = weeksmap.get(week);
								monthdays += days.length;
								days.forEach(function(day){
									var window = {
										type: 'day',
										day: day,
										estimatedhours: 8,
										workedhours: 0,
										sal: 0,
										isoDate: day + '/' + budgetmonth + '/' + budgetyear
									};
									windows.push(window);
									businessdays[businessdaysnum] = day;
									businessdaysnum++;
								});
							});

							var budget = {
								from: zero2.pad(firstDay) + '/' + zero2.pad(budgetmonth + 1) + "/" + budgetyear,
		    				to: zero2.pad(lastDay) + '/' + zero2.pad(budgetmonth + 1) + "/" + budgetyear,
		    				year: budgetyear,
	    	    		month: datepickerto._o.i18n.months[budgetmonth],
								days: monthdays,
								businessdays: JSON.stringify(businessdays),
								amount: parseFloat((budgettot * (monthdays/daystot)).toFixed(2)),
								windows: windows,
	    	    		projectId: $scope.project.id
	    	    	};

							if ($scope.project.budgets[budgetCount]) {
								var id = $scope.project.budgets[budgetCount].id;
								budget.id = id;
								budget.status = 'update';
								$scope.project.budgets[budgetCount] = budget;
							} else {
								budget.status = 'save';
								$scope.project.budgets.push(budget);
							}

							budgetCount++;

						});
					});

					if (budgetCount < budgetsStatus.length) {
						$scope.project.budgets.forEach(function(budget){
							if (!budget.status) {
								budget.status = 'delete';
							}
						});
					}
					console.log('new budgets: ' +
						JSON.stringify($scope.project.budgets, null, '\t'));

					// set budgets days
					setBudgetsDays();

	    		for (var i in $scope.project.budgets) {
	    			console.log('budget amount: ' +
							$scope.project.budgets[i].amount + '; type: ' +
							typeof $scope.project.budgets[i].amount);
	    		}

	    	} else {
	    		throw 'data di inizio maggiore di quella finale';
	    	}
	    };

	    $scope.save = function(isFormValid) {
				$scope.submitted = true;
	      console.log('isFormValid: ' + isFormValid);
	      // check to make sure the form is completely valid
	      if (isFormValid) {
					console.log('current customer: ' + JSON.stringify($scope.customer));
					console.log('updating project: ' + JSON.stringify($scope.project));

					$scope.project.customerId = $scope.customer.id;
					crud.POST.saveProject({project: $scope.project})
									 .then(function(report) {
						console.log('save report: ' + JSON.stringify(report));
						// if (report != null &&
						// 		report.response != null &&
						// 		report.error == null) {
						// 	// da rivedere
						// }

						crud.PUT.updateBudgets({
											projectId: $scope.project.id,
											budgets: $scope.project.budgets})
										.then(function(report) {
									console.log('budgets report: ' + JSON.stringify(report));
									loadData($scope.project.id);
						});

					});
	      }
			};

			$scope.budgetFilter = function(value, index, array){
			  return (!value.status || value.status !== 'delete');
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
			};

	}]);
