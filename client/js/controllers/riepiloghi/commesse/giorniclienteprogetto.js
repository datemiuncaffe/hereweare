angular
	.module('riepiloghi')
	.controller('GiorniClienteProgettoController',
      ['$scope', '$state', 'NgTableParams', 'crud', 'resourceBaseUrlBackend',
      function($scope, $state, NgTableParams, crud, resourceBaseUrlBackend) {
		var ref = this;

		var now = moment();
		var currentYear = now.year();
		var currentMonth = now.month();
		console.log('inside GiorniClienteProgettoController: year = ' + currentYear + '; month = ' + currentMonth);

		$scope.totalDays = 0;

		ref.tableParams = new NgTableParams({
			filter: {},
			group: "nomeCliente"
		}, {
			getData: function(params) {
				console.log('params: ' + JSON.stringify(params, null, '\t'));
				console.log('params.url(): ' + JSON.stringify(params.url(), null, '\t'));

				// ajax request to back end
				return crud.GET.EHOUR
				.getGiorniClienteProgetto(params.url()).then(function(data) {
					var res = [];
					if (data != null && data.giorniClienteProgetto != null &&
						data.giorniClienteProgetto.length > 0) {
						console.log('data giorni cliente Progetto: ' +
							JSON.stringify(data.giorniClienteProgetto, null, '\t'));
						res = data.giorniClienteProgetto;
					}

					$scope.totalDays =
						$scope.sumGrouped(res, "giornateMese")
						.toFixed(2).replace(".", ",");

					return res;
				});
			}
		});

		$scope.isLastPage = function() {
			return ref.tableParams.page() === $scope.totalPages();
		};

		$scope.totalPages = function() {
			return Math.ceil(ref.tableParams.total() /
				ref.tableParams.count());
		};

		$scope.sumGrouped = function(data, field) {
			var sum = 0;
			data.forEach(function(item) {
				if (item[field] != null &&
					item[field].length > 0) {
					var dottedValue = item[field].replace(",", ".");
					sum += parseFloat(dottedValue);
				}
			});
			return sum;
		};

	}]);
