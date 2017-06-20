angular
	.module("app")
	.controller("EmployeeFilterController",
			['$scope', '$resource', '$state', '$sessionStorage', '$window',
			 '$log', 'crud', '$q', 'FileSaver', 'Blob', 'excelgen',
	    function($scope, $resource, $state, $sessionStorage, $window,
				 			 $log, crud, $q, FileSaver, Blob, excelgen) {
		$scope.employees = null;
		$scope.selectedEmployee = {};
		$scope.reportIntervals = {
			weeks: [{
				number: 0,
				start: null,
				end: null,
				label: 'Seleziona la settimana'
			}],
			months: [{
				number: 0,
				start: null,
				end: null,
				label: 'Seleziona il mese'
			}],
			quarters: [{
				number: 0,
				start: null,
				end: null,
				label: 'Seleziona il trimestre'
			}]
		};
		var selectedInterval = {
			number: 0,
			start: null,
			end: null,
			label: null
		};

		var monthsNames = ['Gennaio','Febbraio','Marzo','Aprile',
						'Maggio', 'Giugno','Luglio','Agosto','Settembre',
						'Ottobre', 'Novembre','Dicembre'];
		var monthsBack = 12;
		var monthsAhead = 2;
		var now = moment();
		var startDay = now.clone().subtract(monthsBack, 'months');
		var endDay = now.clone().add(monthsAhead, 'months');
		var currentMonthIndex = 0;

		$scope.customers = [];
		$scope.projects = [];
		var projectCodes = [];

		console.log('$sessionStorage: ' +
			JSON.stringify($sessionStorage, null, '\t'));

		$q
		.all([
				crud.GET.EHOUR.getActiveUsers()
		])
		.then(
			function(data) {
				var employees = data[0];
				$scope.employees = employees;
				getReportIntervals($scope.reportIntervals.weeks,
													 $scope.reportIntervals.months,
												 	 $scope.reportIntervals.quarters);

				if ($sessionStorage.selectedEmployeeIndex != null) {
					$scope.selectedEmployee =
						employees[$sessionStorage.selectedEmployeeIndex];
				} else {
					$scope.selectedEmployee = employees[0];
				}

				if ($sessionStorage.selectedWeekIndex != null) {
					$scope.selectedWeek =
						$scope.reportIntervals
									.weeks[$sessionStorage.selectedWeekIndex];
				} else {
					$scope.selectedWeek = $scope.reportIntervals.weeks[0];
				}

				if ($sessionStorage.selectedMonthIndex != null) {
					$scope.selectedMonth =
						$scope.reportIntervals
									.months[$sessionStorage.selectedMonthIndex];
				} else {
					$scope.selectedMonth =
						$scope.reportIntervals.months[currentMonthIndex-1];
				}

				if ($sessionStorage.selectedQuarterIndex != null) {
					$scope.selectedQuarter =
						$scope.reportIntervals
									.quarters[$sessionStorage.selectedQuarterIndex];
				} else {
					$scope.selectedQuarter = $scope.reportIntervals.quarters[0];
				}

				if ($sessionStorage.selectedInterval != null) {
					selectedInterval.start = $sessionStorage.selectedInterval.start;
					selectedInterval.end = $sessionStorage.selectedInterval.end;
				} else {
					selectedInterval.start =
						$scope.reportIntervals.months[currentMonthIndex-1].start;
					selectedInterval.end =
						$scope.reportIntervals.months[currentMonthIndex-1].end;
				}

				searchProjectsAndCustomers($scope.selectedEmployee,
					selectedInterval.start, selectedInterval.end);

			});

		$scope.onEmployeeChange = function() {
			$sessionStorage.selectedEmployeeIndex =
				$scope.employees.indexOf($scope.selectedEmployee);
			searchProjectsAndCustomers($scope.selectedEmployee,
				selectedInterval.start, selectedInterval.end);
		};

		$scope.onWeekChange = function() {
			$scope.selectedMonth = $scope.reportIntervals.months[0];
			$scope.selectedQuarter = $scope.reportIntervals.quarters[0];
			selectedInterval.start = $scope.selectedWeek.start;
			selectedInterval.end = $scope.selectedWeek.end;

			$sessionStorage.selectedWeekIndex =
				$scope.reportIntervals.weeks.indexOf($scope.selectedWeek);
			$sessionStorage.selectedMonthIndex = 0;
			$sessionStorage.selectedQuarterIndex = 0;
			$sessionStorage.selectedInterval = selectedInterval;

			searchProjectsAndCustomers($scope.selectedEmployee,
				selectedInterval.start, selectedInterval.end);
		};

		$scope.onMonthChange = function() {
			$scope.selectedWeek = $scope.reportIntervals.weeks[0];
			$scope.selectedQuarter = $scope.reportIntervals.quarters[0];
			selectedInterval.start = $scope.selectedMonth.start;
			selectedInterval.end = $scope.selectedMonth.end;

			$sessionStorage.selectedWeekIndex = 0;
			$sessionStorage.selectedMonthIndex =
				$scope.reportIntervals.months.indexOf($scope.selectedMonth);
			$sessionStorage.selectedQuarterIndex = 0;
			$sessionStorage.selectedInterval = selectedInterval;

			searchProjectsAndCustomers($scope.selectedEmployee,
				selectedInterval.start, selectedInterval.end);
		};

		$scope.onQuarterChange = function() {
			$scope.selectedWeek = $scope.reportIntervals.weeks[0];
			$scope.selectedMonth = $scope.reportIntervals.months[0];
			selectedInterval.start = $scope.selectedQuarter.start;
			selectedInterval.end = $scope.selectedQuarter.end;

			$sessionStorage.selectedWeekIndex = 0;
			$sessionStorage.selectedMonthIndex = 0;
			$sessionStorage.selectedQuarterIndex =
				$scope.reportIntervals.quarters.indexOf($scope.selectedQuarter);
			$sessionStorage.selectedInterval = selectedInterval;

			searchProjectsAndCustomers($scope.selectedEmployee,
				selectedInterval.start, selectedInterval.end);
		};

		$scope.onCustomersChange = function() {
			console.log('selected customers: ' +
				JSON.stringify($scope.selectedCustomers, null, '\t'));
			var selectedProjects = [];
			projectCodes = [];
			$scope.selectedCustomers.forEach(function(selectedCustomer){
				selectedCustomer.projects.forEach(function(index){
					selectedProjects.push($scope.projects[index]);
					projectCodes
						.push("'" + $scope.projects[index].projectCode + "'");
				});
			});
			$scope.selectedProjects = selectedProjects;
		};

		$scope.onProjectsChange = function() {
			console.log('selected projects: ' +
				JSON.stringify($scope.selectedProjects, null, '\t'));
			var selectedCustomers = [];
			projectCodes = [];
			$scope.selectedProjects.forEach(function(selectedProject){
				selectedCustomers.push($scope.customers[selectedProject.customer]);
				projectCodes
					.push("'" + selectedProject.projectCode + "'");
			});
			$scope.selectedCustomers = selectedCustomers;
		};

		$scope.clearCustomersSelection = function() {
			console.log("clear customers selection");
			$scope.selectedCustomers = [];
		};

		$scope.clearProjectsSelection = function() {
			console.log("clear projects selection");
			$scope.selectedProjects = [];
			projectCodes = [];
		};

		$scope.viewReport = function() {
			console.log('(search) selectedEmployee: ' +
				JSON.stringify($scope.selectedEmployee, null, '\t'));
			console.log('projectCodes: ' + projectCodes);
			var currentPageUrl = $window.location.href;
         var url = currentPageUrl.slice(0, currentPageUrl.lastIndexOf('#')) +
					'#/reporting/report/employee' +
					'?cognomeDipendente=' +
					$scope.selectedEmployee.cognomeDipendente +
					'&nomeDipendente=' +
					$scope.selectedEmployee.nomeDipendente +
					'&startDate=' + selectedInterval.start +
					'&endDate=' + selectedInterval.end +
					'&projectCodes=' + projectCodes;
	    $log.log(url);
	    $window.location.href = url;
		};

		function getReportIntervals(reportWeeks,
							reportMonths, reportQuarters) {
			var currentDay = startDay;
			var weeks = {};
			var months = {};
			var quarters = {};
			while (currentDay.year() < endDay.year() ||
						 (currentDay.week() <= endDay.week() &&
						  currentDay.year() == endDay.year())) {
				var currentDayOfWeek = currentDay.clone();
				var numberOfWeek = currentDayOfWeek.week() + '-' +
						currentDayOfWeek.endOf('week').year();
				var startOfWeek = currentDayOfWeek.startOf('week')
						.format('YYYY-MM-DD');
				var endOfWeek = currentDayOfWeek.endOf('week')
						.format('YYYY-MM-DD');
				var labelOfWeek = currentDayOfWeek.week() + ': (' +
						startOfWeek + ' | ' + endOfWeek + ')';

				weeks[numberOfWeek] = {
					number: numberOfWeek,
					start: startOfWeek,
					end: endOfWeek,
					label: labelOfWeek
				};

				var currentDayOfMonth = currentDay.clone();
				var numberOfMonth = currentDayOfMonth.month() + '-' +
						currentDayOfMonth.endOf('month').year();
				var startOfMonth = currentDayOfMonth.startOf('month')
						.format('YYYY-MM-DD');
				var endOfMonth = currentDayOfMonth.endOf('month')
						.format('YYYY-MM-DD');
				var labelOfMonth = currentDayOfMonth.endOf('month').year() +
						'-' + monthsNames[currentDayOfMonth.month()] + ': (' +
						startOfMonth + ' | ' + endOfMonth + ')';

				if (months[numberOfMonth] == null) {
					months[numberOfMonth] = {
						number: numberOfMonth,
						start: startOfMonth,
						end: endOfMonth,
						label: labelOfMonth
					};
				}

				var currentDayOfQuarter = currentDay.clone();
				var numberOfQuarter = currentDayOfQuarter.quarter() + '-' +
						currentDayOfQuarter.endOf('quarter').year();
				var startOfQuarter = currentDayOfQuarter.startOf('quarter')
						.format('YYYY-MM-DD');
				var endOfQuarter = currentDayOfQuarter.endOf('quarter')
						.format('YYYY-MM-DD');
				var labelOfQuarter = currentDayOfQuarter.endOf('quarter').year() +
						'-' + currentDayOfQuarter.quarter() + ': (' +
						startOfQuarter + ' | ' + endOfQuarter + ')';

				if (quarters[numberOfQuarter] == null) {
					quarters[numberOfQuarter] = {
						number: numberOfQuarter,
						start: startOfQuarter,
						end: endOfQuarter,
						label: labelOfQuarter
					};
				}
				//console.log('currentDay: ' + currentDay.toString());
				currentDay = currentDay.add(1, 'weeks');
			}
			//console.log('weeks: ' + JSON.stringify(weeks, null, '\t'));
			//return weeks;
			var weeksKeys = Object.keys(weeks);
			weeksKeys.forEach(function(key) {
				reportWeeks.push(weeks[key]);
			});
			var monthsKeys = Object.keys(months);
			var currentnumberOfMonth = now.month() + '-' +
						now.endOf('month').year();
			monthsKeys.forEach(function(key) {
				if (currentnumberOfMonth == months[key].number) {
					currentMonthIndex = reportMonths.length;
					months[key].label = 'mese corrente';
				}
				reportMonths.push(months[key]);
			});
			var quartersKeys = Object.keys(quarters);
			quartersKeys.forEach(function(key) {
				reportQuarters.push(quarters[key]);
			});
		};

		function searchProjectsAndCustomers(employee, startDate, endDate) {
			var params = {
				username: employee.cognomeDipendente,
				startDate: startDate,
				endDate: endDate
			};

			$q
			.all([
					crud.GET.EHOUR.getProjectsAndCustomersByUserNameAndDateInterval(params)
			])
			.then(
				function(data) {
					console.log('data: ' + JSON.stringify(data, null, '\t'));
					console.log('data customers: ' +
						JSON.stringify(data.customers, null, '\t'));
					console.log('data projects: ' +
						JSON.stringify(data.projects, null, '\t'));
					$scope.customers = data[0].customers;
					$scope.projects = data[0].projects;
					console.log('customers: ' + $scope.customers);
					console.log('projects: ' + $scope.projects);
				});
		};

		$scope.viewChart = function() {
			var currentPageUrl = $window.location.href;
         var url = currentPageUrl.slice(0, currentPageUrl.lastIndexOf('#')) +
					'#/reporting/chart/employee' +
					'?cognomeDipendente=' +
					$scope.selectedEmployee.cognomeDipendente +
					'&nomeDipendente=' +
					$scope.selectedEmployee.nomeDipendente +
					'&startDate=' + selectedInterval.start +
					'&endDate=' + selectedInterval.end +
					'&projectCodes=' + projectCodes;
	    $log.log(url);
	    $window.location.href = url;
		};

	}]);
