angular
	.module("app")
	.controller("OverviewProgettiController",
		['$scope', '$resource', '$state', '$compile', 'crud', '$q',
		function($scope, $resource, $state, $compile, crud, $q) {

			var tbody = angular.element(document)
				.find("table.hereweare-datatable tbody");
			function asyncRenderRow(groupRowData) {
				//setTimeout(function() {
					var template = "<tr class=\"hereweare-datatable-group-row\">" +
							   "<td colspan=\"6\">" +
							      groupRowData["name"] +
							   "</td>" +
							"</tr>";

					var linkFn = $compile(template);
					var content = linkFn($scope);

					tbody.append(content);

					// $scope.$apply(function() {
               //    tbody.append(content);
               // });

					groupRowData["projects"].forEach(function(rowData) {
						var row = "<tr>";
						["name", "code"].forEach(function(columnKey) {
							row += "<td><a ui-sref=\"projectdetail({ projectId: " +
									rowData.projectId + " })\" " +
									"title=\"" + rowData.projectId + "\">" +
									rowData[columnKey] + "</a></td>";
						});
						row += "</tr>";

						linkFn = $compile(row);
						content = linkFn($scope);
						tbody.append(content);
					});

				//}, 200);
		   };

			var resource = crud.GET.HEREWEARE.getProjectsInCustomers();
			resource.then(function(data) {
				console.log('OverviewProgettiController getData: ' + JSON.stringify(data, null, '\t'));

				data["projectsInCustomer"].forEach(function(groupRowData) {
					// var template = "<hereweare-datatable-row data=\"" +
					// 		groupRowData["name"] + "\">"
					// 		"</hereweare-datatable-row>";

					asyncRenderRow(groupRowData);
					// var template = "<tr class=\"hereweare-datatable-group-row\">" +
					// 		   "<td colspan=\"6\">" +
					// 		      groupRowData["name"] +
					// 		   "</td>" +
					// 		"</tr>";
					//
					// var linkFn = $compile(template);
					// var content = linkFn($scope);
					//
					// tbody.append(content);
				});

			}).catch(function(err) {
				console.log('OverviewProgettiController getData reject');
				return {error: err};
			});

	}]);
