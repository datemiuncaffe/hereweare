angular
	.module("app")
	.controller("MigrateEhourTablesController",
			['$scope', '$window', '$log', 'crud', '$q',
			 function($scope, $window, $log, crud, $q) {
		$scope.ehourTables = [];
		$scope.selectedEhourTables = [];

		$q.all([
			crud.GET.EHOUR.showTables()
		])
		.then(function(data) {
			if (data[0] != null &&
				 data[0].length > 0) {
				$scope.ehourTables = data[0];
				$scope.selectedEhourTables.push(data[0][0]);
				$log.log('ehourTables: ' +
					JSON.stringify($scope.ehourTables, null, '\t') +
					'; selectedEhourTables: ' +
					JSON.stringify($scope.selectedEhourTables, null, '\t'));
			}
		});

		$scope.onEhourTablesChange = function() {
			$log.log('onChange... ehourTables: ' +
				JSON.stringify($scope.ehourTables, null, '\t') +
				'; selectedEhourTables: ' +
				JSON.stringify($scope.selectedEhourTables, null, '\t'));
		};

		$scope.migrateTables = function() {
			$log.log('migrating tables: ' +
				JSON.stringify($scope.selectedEhourTables, null, '\t'));

			var url = 'http://' + $window.location.host +
					'/#/migrate';
	    	$log.log(url);
		};

	}]);
