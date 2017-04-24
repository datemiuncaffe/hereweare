(function(){
  'use strict';

  angular.module('authorizeService', []).factory('$authorizeService',
      ['$log', function ($log) {

         var Roles = {
            ADMIN: {
               id: 1,
               name: 'admin'
            },
            COMM: {
               id: 2,
               name: 'comm'
            },
            FIN: {
               id: 3,
               name: 'fin'
            },
            PROD: {
               id: 4,
               name: 'prod'
            },
            TEST: {
               id: 5,
               name: 'test'
            }
         };

         return {
            check: function() {
               $log.info('$authorizeService check ...');
            },
            getRole: function(hwuser) {
               $log.info('$authorizeService getRole from hwuser ...');
               switch (hwuser.name) {
                  case "ADMIN":
                     hwuser.role.id = Roles["ADMIN"].id;
                     hwuser.role.name = Roles["ADMIN"].name;
                     break;
                  case "COMM":
                     hwuser.role.id = Roles["COMM"].id;
                     hwuser.role.name = Roles["COMM"].name;
                     break;
                  case "FIN":
                     hwuser.role.id = Roles["FIN"].id;
                     hwuser.role.name = Roles["FIN"].name;
                     break;
                  case "PROD":
                     hwuser.role.id = Roles["PROD"].id;
                     hwuser.role.name = Roles["PROD"].name;
                     break;
                  case "TEST":
                     hwuser.role.id = Roles["TEST"].id;
                     hwuser.role.name = Roles["TEST"].name;
                     break;
                  default:
                     hwuser.role.id = Roles["ADMIN"].id;
                     hwuser.role.name = Roles["ADMIN"].name;
                     break;
               }
               return hwuser;
            }
         };

      }]);

})();
