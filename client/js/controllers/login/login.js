(function(){
  'use strict';

  angular.module('appLogin')
    .controller('LoginController',
        ['$rootScope', '$scope', '$window', '$location',
         '$cookies', '$authenService', '$authorizeService',
        function ($rootScope, $scope, $window, $location,
          $cookies, $authenService, $authorizeService) {

      $scope.hwuser = {
         name: 'DEFAULT',
         email: 'DEFAULT@senseisrl.it',
         password: 'PASS',
         role: {
            id: 0,
            name: ''
         },
         status: {
            isAuthen: false
         },
         session: {
            id: 0
         }
      };

      console.log('hwAuthCookie: ' +
         JSON.stringify($cookies.getObject('hwAuth'), null, '\t'));

      $scope.message = '';
      $scope.register = function(){
        // create user in local mongodb
				$authorizeService.createHwuser($scope.hwuser)
          .then(function(hwuser) {
  					console.log('created hwuser: ' + JSON.stringify(hwuser));
            $scope.message = 'Welcome';
				  })
          .error(function (data, status, headers, config) {
            // Handle login errors here
            $scope.message = 'Error: Invalid user or password';
          });
      };

      $scope.login = function() {
        console.log("login");
        console.log("hwuser: " + JSON.stringify($scope.hwuser, null, '\t'));

        // authen
        authenticate($scope.hwuser);
        console.log("authenticated hwuser: " +
         JSON.stringify($scope.hwuser, null, '\t'));

        // getRole from author service
        getRole($scope.hwuser);
        console.log("authorized hwuser: " +
         JSON.stringify($scope.hwuser, null, '\t'));

        // cookie
        console.log('hwAuthCookie: ' +
         JSON.stringify($cookies.get('hwAuth'), null, '\t'));
        $cookies.put('hwAuth', JSON.stringify($scope.hwuser));

        var loginPageUrl = $window.location.href;
        var homePageUrl =
            loginPageUrl.slice(0, loginPageUrl.lastIndexOf('/')) +
            '/';
        $window.location.href = homePageUrl;
        //$location.path(url);
        //$location.url(url);
        //$location.path('/');
        //$location.url('/');
        //$location.replace();
      };

      // call authen service ...
      function authenticate(hwuser) {
         console.log('authenticate...');
         //console.log('authenService: ' + $authenService);
         $authenService.authen(hwuser);
      };

      // call author service ...
      function getRole(hwuser) {
         console.log('getRole from authorizeService...');
         $authorizeService.getRole(hwuser);
      };

    }]);

})();
