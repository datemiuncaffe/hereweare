angular
   .module('riepiloghi')
   .controller('GiorniClienteController', ['$scope', '$state', 'NgTableParams', '$resource', 'resourceBaseUrl',
         function($scope, $state, NgTableParams, $resource, resourceBaseUrl) {
      var ref = this;

      var now = moment();
      var currentYear = now.year();
      var previousMonth = now.month();
      var currentMonth = now.month() + 1;
      console.log('inside GiorniClienteController: ' +
         '; year = ' + currentYear + '; month = ' + currentMonth);

      // set table filter
      var tablefilter = {
         yearIn: currentYear,
         yearFin: currentYear,
         meseIn: currentMonth,
         meseFin: currentMonth
      };

      $scope.totalDays = 0;

      var query = $resource('http://' + resourceBaseUrl + '/query_giorni_lav_cliente_mese');

      ref.tableParams = new NgTableParams({
            filter: tablefilter,
            group: "mese"
         },
         {
         	getData : function(params) {
         		console.log('params: ' + JSON.stringify(params, null, '\t'));
         		console.log('params.url(): ' + JSON.stringify(params.url(), null, '\t'));

         		// ajax request to back end
         		return query.get(params.url()).$promise.then(function(data) {
         			var res = [];
         			if (data != null && data.giorniCliente != null && data.giorniCliente.length >0) {
         				console.log('data.giorniCliente: ' + JSON.stringify(data.giorniCliente, null, '\t'));
         				res = data.giorniCliente;
         			}

                  $scope.totalDays =
                     $scope.sumGrouped(res, "giornateMese")
                        .toFixed(2).replace(".",",");

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

      $scope.isLastPage = function() {
        return ref.tableParams.page() === $scope.totalPages();
      };

      $scope.totalPages = function(){
        return Math.ceil(ref.tableParams.total() /
          ref.tableParams.count());
      };

      $scope.sumGrouped = function(data, field) {
        var sum = 0;
        data.forEach(function(item){
          if (item[field] != null &&
              item[field].length > 0) {
            var dottedValue = item[field].replace(",",".");
            sum += parseFloat(dottedValue);
          }
        });
        return sum;
      };

   }]);
