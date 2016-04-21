angular
  .module('app', [
    'lbServices',
    'hwlog-service',
    'ngResource',
    'ui.router',
    'ngTable'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
      $urlRouterProvider) {
      $stateProvider
      .state('costi', {
        url: '',
        views:{
          'noteview': {
             templateUrl: 'views/note.html',
             controller: 'NoteController'
          },
          'costiview': {
             templateUrl: 'views/costi.html',
             controller: 'CostiController'
          },
          'budgetview': {
             templateUrl: 'views/budget.html',
             controller: 'BudgetController'
          }
        }
      })
      .state('oremese', {
		url: 'oremese',
		views:{
		  'oremeseview': {
	         templateUrl: 'views/oremese.html',
	         controller: 'OreMeseController'
		  }
		}
      })
      .state('giornicommessautente', {
		url: 'giornicommessautente',
		views:{
		  'giornicommessautenteview': {
	         templateUrl: 'views/giornicommessautente.html',
	         controller: 'GiorniCommessaUtenteController'
		  }
		}
      })
      .state('giornicommessa', {
		url: 'giornicommessa',
		views:{
		  'giornicommessaview': {
	         templateUrl: 'views/giornicommessa.html',
	         controller: 'GiorniCommessaController'
		  }
		}
      })
      .state('giorni', {
		url: 'giorni',
		views:{
		  'giorniview': {
	         templateUrl: 'views/giorni.html',
	         controller: 'GiorniController'
		  }
		}
      })
      .state('giornicliente', {
		url: 'giornicliente',
		views:{
		  'giorniclienteview': {
	         templateUrl: 'views/giornicliente.html',
	         controller: 'GiorniClienteController'
		  }
		}
      })
      .state('giorniclienteprogetto', {
		url: 'giorniclienteprogetto',
		views:{
		  'giorniclienteprogettoview': {
	         templateUrl: 'views/giorniclienteprogetto.html',
	         controller: 'GiorniClienteProgettoController'
		  }
		}
      });

//    $urlRouterProvider.otherwise('todo');
  }]);
