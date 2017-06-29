angular
	.module("app")
	.controller("NewProjectsController",
							['$rootScope', '$scope', '$q', 'crud', 'hwtables',
							function($rootScope, $scope, $q, crud, hwtables) {
		$scope.customers = null;
		$scope.sectionId = "newprojects";
		$scope.projectsContainer = "div.newprojects";
		hwtables.sectionId = $scope.sectionId;
		hwtables.projectsContainer = $scope.projectsContainer;

    $q.all([
		  crud.GET.EHOUR.getCustomers({customerGroup: 'NEW'})
		])
		.then(function(data) {
			if (data[0].length > 0) {
				var customers = data[0];
				$scope.customers = customers;
			}
		});

		var minperiod = 6;

		$scope.$on('onRepeatLast', function(event, element, attrs){
			var idelementList = [];
			$(element).parent()
								.find("div.customer")
								.each(function(index) {
									var element = $(this);
									var customerId = $(this).attr("data-customer-id");
									// console.log('customerId = ' + customerId);
									var idelement = {id:customerId,elem:element};
									idelementList.push(idelement);
									// if (customerId == '19' || customerId == '16') {
									// 	getActiveProjectsByCustomerId(customerId, element, showData);
									// }
									// setTimeout(function() {
									// 	// console.log('processing customerId: ' + customerId);
									// 	getActiveProjectsByCustomerId(customerId, element, showData);
					        // }, index * 500);
								});

			var idelementListLength = idelementList.length;
			var period = minperiod;
			if (idelementListLength < period) {
				period = idelementListLength;
			}
			var numpages = Math.floor(idelementListLength / period);
			console.log('numpages: ' + numpages);
			var pages = [];
			for (var i = 0; i < numpages; i++) {
				pages[i] = idelementList.filter(function(idelement, index) {
					if (i == numpages - 1) {
						return (period * i <= index);
					} else {
						return (period * i <= index && index < period * (i+1));
					}
				});
			}
			pages.forEach(function(page) {
				getActiveProjects(page, showData);
			});
			// getActiveProjects(pages[0], showData);
		});

		function getActiveProjects(page, cb) {
			if (page != null && page.length > 0) {
				var ids = "";
				page.forEach(function(item, index) {
					ids += item.id;
					if (index != (page.length - 1)) {
						ids += ',';
					}
				});
				console.log('ids: ' + ids);

				crud.GET.BOTH.getBudgetsCostsByCustomerIds({ customerIds: ids, projectGroup: 'NEW' })
						.then(function(datatables) {
					console.log('datatables: ' + JSON.stringify(datatables, null, '\t'));
					datatables.forEach(function(item) {
						var curritem = page.filter(function(pageitem) {
							console.log(pageitem.id + '-' + item.customerId + '; check: ' + (pageitem.id == item.customerId));
							return pageitem.id == item.customerId;
						});
						console.log('processed id = ' + curritem[0].id);
						curritem[0].elem.find($scope.projectsContainer).attr("data-datatable", JSON.stringify(item.datatable));
						cb(item.customerId, curritem[0].elem, item.datatable);
					});
				});
			}
		};

		function showData(id, element, datatable) {
			var table = hwtables.insertTable($scope.sectionId, id, element, $scope.projectsContainer);
			// render the table
			hwtables.tabulate(id, table, datatable,
					['projectname', 'projectcode', 'year', 'month', 'budgetdays', 'costdays', 'costhours']);
		};

	}]);
