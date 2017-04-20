(function(){
  'use strict';

  angular.module('appLogin')
    .controller('LoginController',
        ['$rootScope', '$scope', '$window', '$location', 'crud', '$cookies',
        function ($rootScope, $scope, $window, $location, crud, $cookies) {

      $scope.hwuser = {
         name: 'PROD',
         email: 'PROD@senseisrl.it',
         password: 'PRODPSW',
         status: {
            isAuthen: false
         }
      };
      
      console.log('hwAuthCookie: ' +
         JSON.stringify($cookies.getObject('hwAuth'), null, '\t'));

      $scope.message = '';
      $scope.register = function(){
        // create user in local mongodb
				crud.createHwuser($scope.hwuser)
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

        $scope.hwuser.status.isAuthen = true;
        console.log('hwAuthCookie: ' +
         JSON.stringify($cookies.get('hwAuth'), null, '\t'));
        $cookies.put('hwAuth', JSON.stringify($scope.hwuser));

        var url = 'http://' + $window.location.host + '/';
        $window.location.href = url;
        //$location.path(url);
        //$location.url(url);
        //$location.path('/');
        //$location.url('/');
        //$location.replace();
      };

    }]);

})();
