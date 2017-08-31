angular
	.module("hereweareDatatable")
	.directive("hereweareDatatable", function() {
		return {
			restrict: "E",
			scope: {
				sourceName: "="
			},
			controller: HereweareDatatableController,
			templateUrl: function (elem, attrs) {
				console.log('attrs: ' + attrs.sourceName +
					'; conf: ' + JSON.stringify(conf.sources[attrs.sourceName]));
				return conf.sources[attrs.sourceName].template;
			},
			link: function(scope, element, attrs, controller) {
				console.log('hereweareDatatable link');
				controller.getData().then(function(data){
					console.log('HereweareDatatable LINK getData: ' + JSON.stringify(data, null, '\t'));
					controller.compile(data, element);
				});
			}
		};
	});

var conf = {
	sources: {
		customer: {
			type: "simple",
			template: "js/directives/hereweare-datatable/templates/simple.tmlp.html",
			rowsKey: "customers",
			columnsKeys: "name,code"
		},
		projectsInCustomer: {
			type: "grouped",
			template: "js/directives/hereweare-datatable/templates/grouped.tmlp.html",
			rowsKey: "projectsInCustomer.projects",
			columnsKeys: "name,code",
			groupKey: "name"
		}
	}
};

var HereweareDatatableController =
		['$scope', '$log', '$parse', '$compile', '$attrs', '$element', '$document', '$q', 'crud',
			function ($scope, $log, $parse, $compile,	$attrs, $element, $document, $q, crud) {
	console.log('HereweareDatatableController');

	this.crud = crud;
	this.deferred = $q.defer();

	this.$scope = $scope;
	this.$scope.data = null;

	this.sourceName = $attrs.sourceName;
	$scope.rowsKey = conf.sources[$attrs.sourceName].rowsKey;
	$scope.columnsKeys = conf.sources[$attrs.sourceName].columnsKeys;
	$scope.type = conf.sources[$attrs.sourceName].type;
	$scope.groupKey = conf.sources[$attrs.sourceName].groupKey;

	console.log('rowsKey: ' + $scope.rowsKey +
		'; columnsKeys: ' + $scope.columnsKeys +
		'; type: ' + $scope.type + '; groupKey: ' + $scope.groupKey);

	this.getData = function () {
		var _this = this;

		var resource;
		switch (this.sourceName) {
			case 'customer':
				resource = this.crud.GET.HEREWEARE.getCustomers();
				break;
			case 'projectsInCustomer':
				resource = this.crud.GET.HEREWEARE.getProjectsInCustomers();
				break;
			default:
		}
		if (resource) {
			console.log('HereweareDatatableController getting data');
			return resource.then(function(data) {
				console.log('HereweareDatatable getData: ' + JSON.stringify(data, null, '\t'));
				console.log('HereweareDatatableController getData resolve');
				return data;
			}).catch(function(err) {
				console.log('HereweareDatatableController getData reject');
				return {error: err};
			});
		} else {
			return {error: "error: no resource found"};
		}
	};

	this.compile = function(data, element) {
		console.log('HereweareDatatableController compile');

		var tbody = element.find('tbody');
		var groupRowTemplate = "<tr class=\"hereweare-datatable-group-row\">";

		data[$scope.rowsKey.split('.')[0]].forEach(function(groupRowData) {
			var groupRow = groupRowTemplate;
			groupRow += "<td colspan=\"6\">" + groupRowData[$scope.groupKey] + "</td>";
			groupRow += "</tr>";

			var linkFn = $compile(groupRow);
			var content = linkFn($scope);
			tbody.append(content);

			groupRowData[$scope.rowsKey.split('.')[1]].forEach(function(rowData) {
				var row = "<tr>";
				$scope.columnsKeys.split(',').forEach(function(columnKey) {
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

		});


/*
	<tr class="hereweare-datatable-group-row"
			ng-repeat-start="group in data[rowsKey.split('.')[0]]">
		<td colspan="6">
			{{group[groupKey]}}
		</td>
	</tr>
	<tr ng-repeat="row in group[rowsKey.split('.')[1]]">
		<td ng-repeat="columnKey in columnsKeys.split(',')">
			<a ui-sref="projectdetail({ projectId: {{row.projectId}} })"
				title="{{row.projectId}}">
				{{row[columnKey]}}
			</a>
		</td>
	</tr>
	<tr class="" ng-repeat-end></tr>
*/
	};

}];
