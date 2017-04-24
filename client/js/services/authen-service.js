(function(){
  'use strict';

   angular.module('authenService').factory('$authenService',
      ['$log', function ($log) {

         return {
            check: function() {
               $log.info('authenService check ...');
            },
            authen: function(hwuser) {
               $log.info('authenService authen ...');
               hwuser.session.id = 10000;
               hwuser.status.isAuthen = true;
               return hwuser;
            }
         };
         
   }]);

})();
