angular
  .module('appLogin', [
   'authenService',
   'authorizeService',
   'hwlog-service',
   'ngResource',
   'ui.router',
   'crudService',
   'ngAnimate',
   'ngMaterial',
   'ngAria',
   'ngStorage',
   'ngCookies'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$provide',
            function($stateProvider, $urlRouterProvider, $locationProvider, $provide) {


      $locationProvider.hashPrefix('');

      $provide.value('resourceBaseUrl', '$resourceBaseUrl$');
  }]);

angular.module('authenService',[]);
