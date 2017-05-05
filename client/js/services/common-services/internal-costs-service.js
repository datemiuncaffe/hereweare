(function(){
  'use strict';

  angular.module('common.services').factory('internalCosts',
      ['crud', function (crud) {

    var self;
    return self = {
      getEmployeeCosts: function(options, cb) {
        crud.GET.LOCAL.getEmployeeCosts({
          key: 'EHOUR_USERS',
          datatype: 'zset'
        }).then(function(data) {
          //console.log('employee_costs: ' +
          //  JSON.stringify(data, null, '\t'));
          var res = {
            internalCosts: []
          };
          if (data && data.result &&
              data.result.EHOUR_USERS) {
            res.internalCosts = data.result.EHOUR_USERS;
            if (options && options.sorting &&
                options.sorting == 'LASTNAME_FIRSTNAME') {
              sortByLastNameFirstName(res.internalCosts);
            }
          }
          cb(null, res);
        }, function(err) {
          cb(err, null);
        });
      }
    };

    function sortByLastNameFirstName(data) {
      data.sort(function(a, b) {
        var lastNameA = a.lastName.toUpperCase();
        var lastNameB = b.lastName.toUpperCase();
        var firstNameA = a.firstNameA.toUpperCase();
        var firstNameB = b.firstNameB.toUpperCase();
        return lastNameA < lastNameB ? -1 :
              (lastNameA > lastNameB ? 1 :
                (firstNameA < firstNameB ? -1 :
                  (firstNameA > firstNameB ? 1 : 0)));
      });
    };

  }]);

})();
