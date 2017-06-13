angular
	.module("app")
	.controller("EmployeeChartController",
			['$scope', '$stateParams',
			 'crud', 'FileSaver', 'Blob', 'excelgen',
	    function($scope, $stateParams,
				 			 crud, FileSaver, Blob, excelgen) {
		$scope.selectedEmployee = {
			cognomeDipendente: "",
			nomeDipendente: ""
		};
		var selectedInterval = {
			number: 0,
			start: null,
			end: null,
			label: null
		};
		var projectCodes = "";

		// charts
		var charts = [{
			name: "oregiornaliere",
			data: {
				labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
				series: [
					[5, 2, 4, 2, 0]
				]
			},
			options: {
				//width: 1100,
				//height: 400,
				//fullWidth: true,
				axisX: {
					//divisor: 4
					//ticks: ['01/06/16', '10/06/16']
					labelInterpolationFnc: null
				},
				axisY: {
					//type: Chartist.FixedScaleAxis
					//onlyInteger: true,
					//ticks: [2, 4],
					//offset: 0
				}
			},
			object: null
		},
		{
			name: "orecumulate",
			data: {
				labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
				series: [
					[5, 2, 4, 2, 0]
				]
			},
			options: {
				//width: 1100,
				//height: 400,
				axisX: {
					labelInterpolationFnc: null
				}
			},
			object: null
		}];

		console.log('$stateParams: ' +
			JSON.stringify($stateParams, null, '\t'));

		if ($stateParams.cognomeDipendente != null &&
				$stateParams.cognomeDipendente.length > 0) {
			$scope.selectedEmployee.cognomeDipendente =
				$stateParams.cognomeDipendente;
		}
		if ($stateParams.nomeDipendente != null &&
				$stateParams.nomeDipendente.length > 0) {
			$scope.selectedEmployee.nomeDipendente =
				$stateParams.nomeDipendente;
		}
		if ($stateParams.startDate != null &&
				$stateParams.startDate.length > 0) {
			selectedInterval.start =
				$stateParams.startDate;
		}
		if ($stateParams.endDate != null &&
				$stateParams.endDate.length > 0) {
			selectedInterval.end =
				$stateParams.endDate;
		}
		if ($stateParams.projectCodes != null &&
				$stateParams.projectCodes.length > 0) {
			projectCodes = $stateParams.projectCodes;
		}

		search();

		function search() {
			console.log('(search) selectedEmployee: ' +
				JSON.stringify($scope.selectedEmployee, null, '\t'));

			if ($scope.selectedEmployee != null &&
					$scope.selectedEmployee.cognomeDipendente != null &&
					$scope.selectedEmployee.cognomeDipendente.length > 0 &&
					$scope.selectedEmployee.nomeDipendente != null &&
					$scope.selectedEmployee.nomeDipendente.length > 0 &&
					selectedInterval.start != null &&
					selectedInterval.start.length > 0 &&
					selectedInterval.end != null &&
					selectedInterval.end.length > 0) {
				console.log('searching for employee ' +
										$scope.selectedEmployee.cognomeDipendente +
										'-' + $scope.selectedEmployee.nomeDipendente);

				// query ehour
				crud.GET.EHOUR.getReportsByUserNameAndDateIntervalAndProjects({
							firstName: $scope.selectedEmployee.nomeDipendente,
							lastName: $scope.selectedEmployee.cognomeDipendente,
							startDate: selectedInterval.start,
							endDate: selectedInterval.end,
							projectCodes: projectCodes
						}).then(function(report) {
					console.log('report: ' +
						JSON.stringify(report, null, '\t'));

					var startDay = moment(selectedInterval.start, 'YYYY-MM-DD');
					var endDay = moment(selectedInterval.end, 'YYYY-MM-DD');
					getChartData(charts[0].data,
											 report.inserimenti,
										 	 startDay,
										 	 endDay);
					cumulateData(charts[0].data,
											 charts[1].data);

					if (startDay.week() === endDay.week()) {
						charts[0].options.axisX.labelInterpolationFnc =
							labelInterpolationWeek;
						charts[1].options.axisX.labelInterpolationFnc =
							labelInterpolationWeek;
					} else if (startDay.month() === endDay.month()) {
						charts[0].options.axisX.labelInterpolationFnc =
							labelInterpolationMonth;
						charts[1].options.axisX.labelInterpolationFnc =
							labelInterpolationMonth;
					} else {
						charts[0].options.axisX.labelInterpolationFnc =
							labelInterpolationQuarter;
						charts[1].options.axisX.labelInterpolationFnc =
							labelInterpolationQuarter;
					}

					charts[0].data.object =
						new Chartist.Line('#oregiornaliere',
							charts[0].data, charts[0].options);

					charts[1].data.object =
						new Chartist.Line('#orecumulate',
							charts[1].data, charts[1].options);

				});
			}
		};

		function getChartData(chartData, inserimenti, startDay, endDay){
			chartData.labels = [];
			chartData.series = [];
			var currentDay = startDay.clone();
			while (currentDay.isSameOrBefore(endDay)) {
				var currentDayLabel = currentDay.format('DD/MM/YY');
				//var currentDayLabel = currentDay.format('DD');
				chartData.labels.push(currentDayLabel);
				currentDay = currentDay.add(1, 'days');
			}
			inserimenti.forEach(function(inserimento){
				var alreadypresentseries = chartData.series.filter(function(item){
					return (item.name == inserimento.codiceProgetto);
				});
				//var index = chartData.labels
				//	.indexOf(inserimento.data.slice(0,2));
				var index = chartData.labels
					.indexOf(inserimento.data);
				if (alreadypresentseries.length > 0) {
					if (index > 0) {
						alreadypresentseries[0].data[index] = inserimento.ore;
					}
				} else {
					var linedata = [];
					chartData.labels.forEach(function(label){
						linedata.push(0);
					});
					if (index > 0) {
						linedata[index] = inserimento.ore;
					}
					var line = {
						name: inserimento.codiceProgetto,
						data: linedata
					}
					chartData.series.push(line);
				}
			});
		};

		function cumulateData(chartData, chartDataCumul) {
			chartDataCumul.labels = chartData.labels;
			chartDataCumul.series = [];
			console.log('chartDataCumul.series: ' +
				JSON.stringify(chartDataCumul.series, null, '\t'));
			chartData.series.forEach(function(item) {
				console.log('item: ' +
					JSON.stringify(item, null, '\t'));
				var cumul = 0;
				var itemcumul = {
					name: item.name,
					data: []
				}
				item.data.forEach(function(value, index, arr) {
					console.log('value: ' + value + '; cumul: ' + cumul);
					cumul += value;
					//arr[index] = cumul;
					//console.log('arr[index]: ' + arr[index] + '; cumul: ' + cumul);
					itemcumul.data.push(cumul);
				});
				chartDataCumul.series.push(itemcumul);
			});
		};

		function labelInterpolationWeek(value, index) {
			return moment(value, 'DD/MM/YY').format('ddd-DD');
		};

		function labelInterpolationMonth(value, index, array) {
			//console.log('array: ' + JSON.stringify(array, null, '\t'));
			if (index === 0 || index === (array.length - 1) ||
					moment(value, 'DD/MM/YY').day() === 6) {
				return value;
			}
		};

		function labelInterpolationQuarter(value, index, array) {
			if (moment(value, 'DD/MM/YY').day() === 6) {
				return moment(value, 'DD/MM/YY').format('DD-MMM');
			}
		};

	}]);
