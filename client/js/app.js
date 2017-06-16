angular
  .module('app')
  .config(['$stateProvider', '$urlRouterProvider',
            '$locationProvider', '$provide',
            function($stateProvider, $urlRouterProvider, $locationProvider, $provide) {
      $stateProvider
      .state('activeprojects', {
        url: '/activeprojects',
        views:{
          'activeprojectsview': {
              templateUrl: 'views/projects/activeprojects.html',
              controller: 'ActiveProjectsController'
           }
        }
      })
      .state('senseiprojects', {
        url: '/senseiprojects',
        views:{
          'senseiprojectsview': {
              templateUrl: 'views/projects/senseiprojects.html',
              controller: 'SenseiProjectsController'
           }
        }
      })
      .state('newprojects', {
        url: '/newprojects',
        views:{
          'newprojectsview': {
              templateUrl: 'views/projects/newprojects.html',
              controller: 'NewProjectsController'
           }
        }
      })
      .state('overview', {
        url: '/overview',
        views:{
          'overviewview': {
              templateUrl: 'views/estimate/overview.html',
              controller: 'OverviewController'
           }
        }
      })
      .state('ricerca', {
        url: '/ricerca',
        views:{
          'ricercaview': {
              templateUrl: 'views/estimate/ricerca.html',
              controller: 'RicercaController'
           }
        }
      })
      .state('projectdetail', {
        url: '/projectdetail?customerId&customerName&projectId&projectName&projectCode',
        views:{
          'projectdetailview': {
              templateUrl: 'views/estimate/projectdetail.html',
              controller: 'ProjectDetailController'
           }
        }
      })
      .state('projectmodify', {
        url: '/projectmodify?customerId&customerName&projectId&projectName&projectCode',
        views:{
          'projectmodifyview': {
              templateUrl: 'views/estimate/projectmodify.html',
              controller: 'ProjectModifyController'
           }
        }
      })
      .state('oremese', {
    		url: '/oremese',
    		views:{
    		  'oremeseview': {
    	         templateUrl: 'views/ehourqueries/oremese.html',
    	         controller: 'OreMeseController'
    		  }
    		}
      })
      .state('giornicommessautente', {
    		url: '/giornicommessautente?year&month&projectCode',
    		views:{
    		  'giornicommessautenteview': {
    	         templateUrl: 'views/ehourqueries/giornicommessautente.html',
    	         controller: 'GiorniCommessaUtenteController'
    		  }
    		}
      })
      .state('giornicommessautentewithcomments', {
    		url: '/giornicommessautentewithcomments?year&month&projectCode',
    		views:{
    		  'giornicommessautentewithcommentsview': {
    	         templateUrl: 'views/ehourqueries/giornicommessautentewithcomments.html',
    	         controller: 'giorniCommessaUtenteWithCommentsController'
    		  }
    		}
      })
      .state('giornicommessa', {
    		url: '/giornicommessa',
    		views:{
    		  'giornicommessaview': {
    	         templateUrl: 'views/ehourqueries/giornicommessa.html',
    	         controller: 'GiorniCommessaController'
    		  }
    		}
      })
      .state('giorni', {
    		url: '/giorni',
    		views:{
    		  'giorniview': {
    	         templateUrl: 'views/ehourqueries/giorni.html',
    	         controller: 'GiorniController'
    		  }
    		}
      })
      .state('giornicliente', {
    		url: '/giornicliente',
    		views:{
    		  'giorniclienteview': {
    	         templateUrl: 'views/ehourqueries/giornicliente.html',
    	         controller: 'GiorniClienteController'
    		  }
    		}
      })
      .state('giorniclienteprogetto', {
    		url: '/giorniclienteprogetto',
    		views:{
    		  'giorniclienteprogettoview': {
    	         templateUrl: 'views/ehourqueries/giorniclienteprogetto.html',
    	         controller: 'GiorniClienteProgettoController'
    		  }
    		}
      })
      .state('employeefilter', {
        url: '/reporting/filter/employee',
        views:{
          'employeefilterview': {
              templateUrl: 'views/reporting/filter/employeeFilter.html',
              controller: 'EmployeeFilterController'
           }
        }
      })
      .state('employeereport', {
        url: '/reporting/report/employee?cognomeDipendente&nomeDipendente&startDate&endDate&projectCodes',
        views:{
          'employeereportview': {
              templateUrl: 'views/reporting/report/employeeReport.html',
              controller: 'EmployeeReportController'
           }
        }
      })
      .state('employeechart', {
        url: '/reporting/chart/employee?cognomeDipendente&nomeDipendente&startDate&endDate&projectCodes',
        views:{
          'employeechartview': {
              templateUrl: 'views/reporting/chart/employeeChart.html',
              controller: 'EmployeeChartController'
           }
        }
      })
      .state('employeecosts', {
        url: '/working/employee-costs',
        views:{
          'employeecostsview': {
              templateUrl: 'views/working/employeeCosts.html',
              controller: 'EmployeeCostsController'
           }
        }
      })
      .state('migrateehourtables', {
        url: '/migrate/ehour-tables',
        views:{
          'migrateehourtablesview': {
              templateUrl: 'views/migrate/ehourTables.html',
              controller: 'MigrateEhourTablesController'
           }
        }
      });

      $urlRouterProvider.otherwise('overview');

      $locationProvider.hashPrefix('');

      $provide.value('resourceBaseUrl', '$resourceBaseUrl$');
  }])
  //take all whitespace out of string
  .filter('nospace', function () {
    return function (value) {
      return (!value) ? '' : value.replace(/ /g, '');
    };
  })
  //replace uppercase to regular case
  .filter('humanizeDoc', function () {
    return function (doc) {
      if (!doc) return;
      if (doc.type === 'directive') {
        return doc.name.replace(/([A-Z])/g, function ($1) {
          return '-' + $1.toLowerCase();
        });
      }

      return doc.label || doc.name;
    };
  })
  .directive('onLastRepeat', function() {
		return function(scope, element, attrs) {
			if (scope.$last) {
				setTimeout(function() {
						scope.$emit('onRepeatLast', element, attrs);
				}, 1);
			}
		};
   })
   .controller('MainController',
      ['$rootScope', '$scope', '$window', '$location', 'crud', '$cookies', 'menu',
      function ($rootScope, $scope, $window, $location, crud, $cookies, menu) {
         var currentPageUrl = $window.location.href;
         $scope.loginPageUrl =
            currentPageUrl.slice(0, currentPageUrl.lastIndexOf('/')) +
            '/login.html';

         $scope.hwAuthCookie = $cookies.getObject('hwAuth');
         console.log('hwAuthCookie: ' +
            JSON.stringify($scope.hwAuthCookie, null, '\t'));

         if (!$scope.hwAuthCookie) {
            $window.location.href = $scope.loginPageUrl;
            //$location.path(url);
         } else {
            console.log('MENU: ' + menu);
            $scope.verticalSections =
               menu.getSections("verticalSections", $scope.hwAuthCookie.role.id);
            $scope.orizontalSections =
               menu.getSections("orizontalSections", $scope.hwAuthCookie.role.id);
         }

         $scope.logout = function() {
            console.log('removing hwAuth cookie ...');
            $cookies.remove('hwAuth');
            console.log('redirect to: ' + $scope.loginPageUrl);
            $window.location.href = $scope.loginPageUrl;
         }

   }]);
