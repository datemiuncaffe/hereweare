angular
  .module('appLogin', [
   'authenService',
   'authorizeService',
   'hwlog-service',
   'ngResource',
   'ui.router',
   'ngAnimate',
   'ngMaterial',
   'ngAria',
   'ngStorage',
   'ngCookies'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$provide',
            function($stateProvider, $urlRouterProvider, $locationProvider, $provide) {


      $locationProvider.hashPrefix('');

      $provide.value('resourceBaseUrlBackend', '$resourceBaseUrlBackend$');
  }]);

angular.module('authenService',[]);
