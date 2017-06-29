angular
  .module('riepiloghi')
  .controller('GiorniClienteProgettoController', ['$scope', '$state', 'NgTableParams', '$resource', 'resourceBaseUrl', function($scope,
		  $state, NgTableParams, $resource, resourceBaseUrl) {
	  var ref = this;

    var now = moment();
    var currentYear = now.year();
    var currentMonth = now.month();
    console.log('inside GiorniClienteProgettoController: year = ' + currentYear + '; month = ' + currentMonth);

    var query = $resource('http://' + resourceBaseUrl + '/query_giorni_lav_cliente_progetto_mese');

    ref.tableParams = new NgTableParams({
        filter: {
        }
      },
      {
    		getData : function(params) {
    			console.log('params: ' + JSON.stringify(params, null, '\t'));
    			console.log('params.url(): ' + JSON.stringify(params.url(), null, '\t'));

    			// ajax request to back end
    			return query.get(params.url()).$promise.then(function(data) {
    				var res = [];
    				if (data != null && data.giorniClienteProgetto != null &&
                   data.giorniClienteProgetto.length >0) {
    					console.log('data giorni cliente Progetto: ' +
                     JSON.stringify(data.giorniClienteProgetto, null, '\t'));
    					res = data.giorniClienteProgetto;
    				}
    				return res;
    			});
    		}
  	});
  }]);
