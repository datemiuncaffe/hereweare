angular
	.module("hereweareDatatable")
	.directive("hereweareDatatableRow", function() {
		return {
			restrict: "E",
			scope: {
				data: "="
			},
			templateUrl: "js/directives/hereweare-datatable/templates/row.tmlp.html"
		};
	});
