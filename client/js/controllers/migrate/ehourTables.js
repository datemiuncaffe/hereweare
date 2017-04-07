angular
	.module("app")
	.controller("MigrateEhourTablesController",
			['$scope', '$window', '$log', 'crud', '$q',
			 function($scope, $window, $log, crud, $q) {
		$scope.ehourTables = [];
		$scope.selectedTables = [];

		$q.all([
			crud.GET.EHOUR.showTables()
		])
		.then(function(data) {
			if (data[0] != null &&
				 data[0].ehourTables != null &&
				 data[0].ehourTables.length > 0) {
				$scope.ehourTables = data[0].ehourTables;
				$log.log('ehourTables: ' +
					JSON.stringify($scope.ehourTables, null, '\t'));
			}
		});

		$scope.onTableChange = function() {
			$log.log('onTableChange: ' +
				JSON.stringify($scope.selectedTables, null, '\t'));
		};

		$scope.migrateTables = function() {
			$log.log('migrating tables: ' +
				JSON.stringify($scope.selectedTables, null, '\t'));

			var url = 'http://' + $window.location.host +
					'/#/reporting/report/employee';
	    	$log.log(url);
	    	//$window.location.href = url;
		};

	}]);
