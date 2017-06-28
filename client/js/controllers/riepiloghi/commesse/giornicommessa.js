angular
  .module('riepiloghi')
  .controller('GiorniCommessaController', ['$scope', '$state', 'NgTableParams', '$resource', 'resourceBaseUrl', function($scope,
		  $state, NgTableParams, $resource, resourceBaseUrl) {
	  var ref = this;

    var now = moment();
    var currentYear = now.year();
    var currentMonth = now.month();
    console.log('inside GiorniCommessaController: year = ' + currentYear + '; month = ' + currentMonth);

    var query = $resource('http://' + resourceBaseUrl + '/query_giorni_lav_commessa_mese');

    ref.tableParams = new NgTableParams({
        filter: {
          anno: currentYear,
          mese: currentMonth
        }
      },
      {
    		getData : function(params) {
    			console.log('params: ' + JSON.stringify(params, null, '\t'));
    			console.log('params.url(): ' + JSON.stringify(params.url(), null, '\t'));

    			// ajax request to back end
    			return query.get(params.url()).$promise.then(function(data) {
    				var res = [];
    				if (data != null && data.giorniCommessa != null && data.giorniCommessa.length > 0) {
    					console.log('data giorni Commessa: ' + JSON.stringify(data.giorniCommessa, null, '\t'));
    					res = data.giorniCommessa;
    				}
    				return res;
    			});
    		}
    	});
  }]);
