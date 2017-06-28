angular
  .module('riepiloghi')
  .controller('GiorniController', ['$scope', '$state', 'NgTableParams', '$resource', 'resourceBaseUrl', function($scope,
		  $state, NgTableParams, $resource, resourceBaseUrl) {
  	var ref = this;

    var now = moment();
    var currentYear = now.year();
    var currentMonth = now.month();
    console.log('inside GiorniController: year = ' + currentYear + '; month = ' + currentMonth);

    var query = $resource('http://' + resourceBaseUrl + '/query_giorni_lav_mese');

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
    				if (data != null && data.giorni != null && data.giorni.length >0) {
    					console.log('data: ' + JSON.stringify(data, null, '\t'));
    					res = data.giorni;
    				}
    				return res;
    			});
    		}
  	});

    //    var queryData = {
    //    	callFun : function (){
    //        	query.get().$promise.then(function(data) {
    //    			if (data!=null & data.results.length>0) {
    //    				console.log('data.results: ' + data.results);
    //	    			var res = data.results;
    //	    			ref.tableParams = new NgTableParams({}, {
    //	    				data: res
    //	    			});
    //    			}
    //        	});
    //    	}
    //    };
    //    queryData['callFun']();

  }]);
