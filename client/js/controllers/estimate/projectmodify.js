angular
	.module("app")
	.controller("ProjectModifyController", ['$scope', '$resource', '$q', '$stateParams', 'crud', 'resourceBaseUrl', 
	                                        function($scope, $resource, $q, $stateParams, crud, resourceBaseUrl) {
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
	    	budgets: []
	    };	    
	    /* end entities */
	    
	    /* loading project */
	    if ($stateParams != null && 
	    	$stateParams.code != null && $stateParams.code.length > 0 &&
	    	$stateParams.customer != null && $stateParams.customer.length > 0) {
	    	console.log('Project code: ' + $stateParams.code + '; customer: ' + decodeURI($stateParams.customer));
	    	var queryUrl = 'http://' + resourceBaseUrl + '/api/projects?filter[include]=budgets&filter[include]=costs&filter[where][code]=' + $stateParams.code;
	    	var projectRes = $resource(queryUrl, null, {'query':  {method:'GET', isArray:true}});
	    	projectRes.query().$promise.then(function(data) {
				console.log('project: ' + JSON.stringify(data[0]));
				
				$scope.customer = JSON.parse(decodeURI($stateParams.customer));
				$scope.project = data[0];
							
			});
	    }
	    /* end loading project */
	    
	    /* datepickers */
		var datepickerfrom = new Pikaday({
			field : document.getElementById('datepickerfrom'),
			firstDay : 1,
			minDate : new Date(2000, 0, 1),
			maxDate : new Date(2020, 12, 31),
			yearRange : [ 2000, 2020 ]
		});
		var datepickerto = new Pikaday({
			field : document.getElementById('datepickerto'),
			firstDay : 1,
			minDate : new Date(2000, 0, 1),
			maxDate : new Date(2020, 12, 31),
			yearRange : [ 2000, 2020 ]
		});
		/* end datepickers */
	    
	    $scope.getBudgets = function(budgettot, daystot, selectedfrom, selectedto) {
	    	if (budgettot == null) {
	    		throw 'ERR: il budget totale non è stato inserito';
	    	}
	    	console.log('budgettot: ' + budgettot);
	    	if (daystot == null) {
	    		throw 'ERR: i giorni totali non sono stati inseriti';
	    	}
	    	if (selectedfrom == null) {
	    		throw 'ERR: inserire la data iniziale';
	    	}
	    	if (selectedto == null) {
	    		throw 'ERR: inserire la data finale';
	    	}
	    	
	    	var from = moment(selectedfrom, "YYYY-MM-DD");
	    	var to = moment(selectedto, "YYYY-MM-DD");	    	
	    	console.log('diff in months: ' + to.diff(from, 'months'));	    	
	    	
	    	if (from.isBefore(to)) {
	    		$scope.project.budgets = [];
	    		var totaldays = to.diff(from, 'days') + 1;
	    		console.log('totaldays: ' + totaldays);
	    		if (to.diff(from, 'months') === 0) {
	    			var budgettot = {
	    				from: from.year() + '-' + from.month() + '-' + from.date(),
	    				to: from.year() + '-' + from.month() + '-' + from.daysInMonth(),
	    				year: from.year(),
    	    			month: moment.months()[from.month()],
    	    			days: daystot,
    	    			amount: budgettot,
    	    			projectId: $scope.project.id
    	    		};
	    			$scope.project.budgets.push(budgettot);
	    		} else if (to.diff(from, 'months') === 1) {
	    			var budgetFrom = {
	    				from: from.year() + '-' + from.month() + '-' + from.date(),
		    			to: from.year() + '-' + from.month() + '-' + from.daysInMonth(),
		    			year: from.year(),
    	    			month: moment.months()[from.month()],
    	    			days: parseFloat((daystot * ((from.daysInMonth() - from.date() + 1)/totaldays)).toFixed(2)),
    	    			amount: parseFloat((budgettot * ((from.daysInMonth() - from.date() + 1)/totaldays)).toFixed(2)),
    	    			projectId: $scope.project.id
    	    		};
	    			$scope.project.budgets.push(budgetFrom);
	    			
	    			var budgetTo = {
	    				from: to.year() + '-' + to.month() + '-01',
		    			to: to.year() + '-' + to.month() + '-' + to.date(),
		    			year: to.year(),
    	    			month: moment.months()[to.month()],
    	    			days: parseFloat((daystot * (to.date()/totaldays)).toFixed(2)),
    	    			amount: parseFloat((budgettot * (to.date()/totaldays)).toFixed(2)),
    	    			projectId: $scope.project.id
    	    		};	    			
	    			$scope.project.budgets.push(budgetTo);
	    			console.log('budgets: ' + JSON.stringify($scope.project.budgets));
	    		} else {
	    			var budgetFrom = {
	    				from: from.year() + '-' + from.month() + '-' + from.date(),
		    			to: from.year() + '-' + from.month() + '-' + from.daysInMonth(),
		    			year: from.year(),
    	    			month: moment.months()[from.month()],
    	    			days: parseFloat((daystot * ((from.daysInMonth() - from.date() + 1)/totaldays)).toFixed(2)),
    	    			amount: parseFloat((budgettot * ((from.daysInMonth() - from.date() + 1)/totaldays)).toFixed(2)),
    	    			projectId: $scope.project.id
    	    		};
	    			$scope.project.budgets.push(budgetFrom);
	    			
	    			for (var i = from.month() + 1; i < to.month(); i++) {
	    	    		var budget = {
	    	    			from: moment({month: i}).year() + '-' + i + '-' + moment({month: i}).date(),
	    			    	to: moment({month: i}).year() + '-' + i + '-' + moment({month: i}).daysInMonth(),
	    			    	year: moment({month: i}).year(),
	    	    			month: moment.months()[i],
	    	    			days: parseFloat((daystot * (moment({month: i}).daysInMonth()/totaldays)).toFixed(2)),
	    	    			amount: parseFloat((budgettot * (moment({month: i}).daysInMonth()/totaldays)).toFixed(2)),
	    	    			projectId: $scope.project.id
	    	    		};
	    	    		$scope.project.budgets.push(budget);
	    	    	}
	    			
	    			var budgetTo = {
	    				from: to.year() + '-' + to.month() + '-01',
			    		to: to.year() + '-' + to.month() + '-' + to.date(),
			    		year: to.year(),
    	    			month: moment.months()[to.month()],
    	    			days: parseFloat((daystot * (to.date()/totaldays)).toFixed(2)),
    	    			amount: parseFloat((budgettot * (to.date()/totaldays)).toFixed(2)),
    	    			projectId: $scope.project.id
    	    		};	    			
	    			$scope.project.budgets.push(budgetTo);
	    		}
	    		for (var i in $scope.project.budgets) {
	    			console.log('budget amount: ' + $scope.project.budgets[i].amount + '; type: ' + typeof $scope.project.budgets[i].amount);
	    		}
	    		
	    	} else {
	    		throw 'data di inizio maggiore di quella finale';
	    	}	    	
	    };
	    
	    var updateproject = $resource('http://' + resourceBaseUrl + '/api/projects', null, {'update': {method:'PUT'}});
	    var updatebudget = $resource('http://' + resourceBaseUrl + '/api/budgets', null, {'update': {method:'PUT', isArray:true}});
	    	    
	    $scope.save = function() {
			console.log('current customer: ' + JSON.stringify($scope.customer));
			console.log('updating project: ' + JSON.stringify($scope.project));			
			
			$scope.project.customerId = $scope.customer.id;
			updateproject.update($scope.project).$promise.then(function(updatedproject) {
				console.log('updatedproject: ' + JSON.stringify(updatedproject));
				updatebudget.update($scope.project.budgets).$promise.then(function(updatedbudgets) {
					console.log('updatedbudgets: ' + JSON.stringify(updatedbudgets));
				});
			});
						
		};
			    
	}]);