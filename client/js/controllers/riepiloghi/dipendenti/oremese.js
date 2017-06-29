angular
   .module('riepiloghi')
   .controller('OreMeseController', ['$scope', '$state', 'NgTableParams', '$resource', 'resourceBaseUrl',
   function($scope, $state, NgTableParams, $resource, resourceBaseUrl) {
      var ref = this;

      var now = moment();
      var currentYear = now.year();
      var previousMonth = now.month();
      var currentMonth = now.month() + 1;
      console.log('inside OreMeseController: ' +
         '; year = ' + currentYear + '; month = ' + currentMonth);

      // set table filter
      var tablefilter = {
         yearIn: currentYear,
         yearFin: currentYear,
         meseIn: currentMonth,
         meseFin: currentMonth
      };

      var query = $resource('http://' + resourceBaseUrl + '/query_ore_lav_utente_mese');

      ref.tableParams = new NgTableParams({
            filter: tablefilter
         },
         {
         	getData : function(params) {
         		console.log('params: ' + JSON.stringify(params, null, '\t'));
         		console.log('params.url(): ' + JSON.stringify(params.url(), null, '\t'));

         		// ajax request to back end
         		return query.get(params.url()).$promise.then(function(data) {
         			var res = [];
         			if (data != null && data.oreLav != null && data.oreLav.length > 0) {
         				console.log('data ore lav: ' + JSON.stringify(data.oreLav, null, '\t'));
         				res = data.oreLav;
         			}
         			return res;
         		});
         	}
         }
      );
      ref.monthFilterByInterval = {
        meseIn: 'templates/table/filters/startMonth.html',
        meseFin: 'templates/table/filters/endMonth.html'
      };
      ref.yearFilterByInterval = {
        yearIn: 'templates/table/filters/startYear.html',
        yearFin: 'templates/table/filters/endYear.html'
      };

   }]);
