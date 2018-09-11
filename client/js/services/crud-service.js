// CommonJS package manager support
if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  // Export the *name* of this Angular module
  // Sample usage:
  //
  //   import lbServices from './crudService';
  //   angular.module('app', [crudService]);
  //
  module.exports = "crudService";
}

(function(window, angular, undefined) {'use strict';

	var module = angular.module("crudService",['angular-cache']);
	module.factory('crud',
         ['$resource', 'CacheFactory', 'resourceBaseUrlBackend', 'resourceBaseUrlOperations',
         function($resource, CacheFactory, resourceBaseUrlBackend, resourceBaseUrlOperations) {
      var budgetsCostsByCustomerIdsCache;
      if (!CacheFactory.get('budgetsCostsByCustomerIdsCache')) {
         budgetsCostsByCustomerIdsCache = CacheFactory('budgetsCostsByCustomerIdsCache', {
            maxAge: 4 * 60 * 1000, // 2 minutes,
            deleteOnExpire: 'aggressive'
         });
      }

      var queries = {
         GET: {
            BOTH: {
               getBudgetsCostsByCustomerIds: 'http://' + resourceBaseUrlBackend +
                  '/ehour/mongo/query/budgets_costs_by_customer_ids'
            },
            LOCAL: {
//    toremove loopback getCustomersAndProjects:	'http://' + resourceBaseUrlBackend +
//    toremove loopback    '/api/customers?filter[include][projects]=budgets',
               getBudgets: 'http://' + resourceBaseUrlBackend + '/models/budgets-ops/budgets',
               fsBrowseDocs: 'http://' + resourceBaseUrlBackend + '/browseDocs',
               getEmployeeCosts: 'http://' + resourceBaseUrlBackend + '/redis/redis-ops/users'
            },
            EHOUR: {
               getActiveUsers: 'http://' + resourceBaseUrlBackend + '/ehour/query/bm/usr/active_users',
               getCustomers: 'http://' + resourceBaseUrlBackend + '/ehour/query/bm/cus/customers',
               getProjectsByCustomerId: 'http://' + resourceBaseUrlBackend +
                  '/ehour/query/bm/pro/projects_by_customer_id',
               getProjectById: 'http://' + resourceBaseUrlBackend +
                  '/ehour/query/bm/pro/project_by_id',
               getCosts: 'http://' + resourceBaseUrlBackend + '/ehour/query/bp/prd/costs',
               getReportsByUserNameAndDateIntervalAndProjects:
                  'http://' + resourceBaseUrlBackend +
                  '/ehour/query/bp/rep/reports_by_username_dateinterval_projects',
               getProjectsAndCustomersByUserNameAndDateInterval:
                  'http://' + resourceBaseUrlBackend +
                  '/ehour/query/bp/rep/projects_customers_by_username_dateinterval',
               showTables: 'http://' + resourceBaseUrlBackend + '/migrate/show_tables',
               getGiorni:
                  'http://' + resourceBaseUrlBackend +
                  '/ehour/query/bp/com/giorni',
               getGiorniCliente:
                  'http://' + resourceBaseUrlBackend +
                  '/ehour/query/bp/com/giorni_cliente',
               getGiorniClienteProgetto:
                  'http://' + resourceBaseUrlBackend +
                  '/ehour/query/bp/com/giorni_cliente_progetto',
               getGiorniCommessa:
                  'http://' + resourceBaseUrlBackend +
                  '/ehour/query/bp/com/giorni_commessa',
               getGiorniCommessaUtente:
                  'http://' + resourceBaseUrlBackend +
                  '/ehour/query/bp/dip/giorni_commessa_utente',
               getGiorniCommessaUtenteWithComments:
                  'http://' + resourceBaseUrlBackend +
                  '/ehour/query/bp/dip/giorni_commessa_utente_with_comments',
               getOreLavUtenteMese:
                  'http://' + resourceBaseUrlBackend +
                  '/ehour/query/bp/dip/ore_lav_utente'
            },
            HEREWEARE: {
               getCustomers: 'http://' + resourceBaseUrlOperations + '/api/model/customer/read',
               getProjectsInCustomers: 'http://' + resourceBaseUrlOperations + '/api/model/projectsInCustomer/read'
            }
         },
         PUT: {
            updateBudgets: 'http://' + resourceBaseUrlBackend +
               '/models/budgets-ops/update-all-by-project-id'
         },
         POST: {
            saveProject: 'http://' + resourceBaseUrlBackend + '/models/projects-ops/save-project',
            fsSave: 'http://' + resourceBaseUrlBackend + '/save',
            saveEmployeeCosts: 'http://' + resourceBaseUrlBackend + '/redis-ops/save-users'
         }
      };

      var resources = {
         GET: {
            BOTH: {
               getBudgetsCostsByCustomerIds:
                  $resource(queries.GET.BOTH.getBudgetsCostsByCustomerIds, null,
                     {'query':
                        {method:'GET',
                        cache: CacheFactory.get('budgetsCostsByCustomerIdsCache'),
                        isArray:true}
                     })
            },
            LOCAL: {
               getCustomersAndProjects:
                  $resource(queries.GET.LOCAL.getCustomersAndProjects, null,
                     {'query': {method:'GET', isArray:true}}),
               getBudgets:
                  $resource(queries.GET.LOCAL.getBudgets, null,
                     {'query': {method:'GET'}}),
               fsBrowseDocs:
                  $resource(queries.GET.LOCAL.fsBrowseDocs, null,
                     {'query': {method:'GET'}}),
               getEmployeeCosts:
                  $resource(queries.GET.LOCAL.getEmployeeCosts, null,
                     {'query': {method:'GET'}})
            },
            EHOUR: {
               getActiveUsers:
                  $resource(queries.GET.EHOUR.getActiveUsers, null,
                     {'query': {method:'GET', isArray:true}}),
               getCustomers:
                  $resource(queries.GET.EHOUR.getCustomers, null,
                     {'query': {method:'GET', isArray:true}}),
               getProjectsByCustomerId:
                  $resource(queries.GET.EHOUR.getProjectsByCustomerId, null,
                     {'query': {method:'GET', isArray:true}}),
               getProjectById:
                  $resource(queries.GET.EHOUR.getProjectById, null,
                     {'query': {method:'GET'}}),
               getCosts:
                  $resource(queries.GET.EHOUR.getCosts, null,
                     {'query': {method:'GET', isArray:true}}),
               getReportsByUserNameAndDateIntervalAndProjects:
                  $resource(queries.GET.EHOUR.getReportsByUserNameAndDateIntervalAndProjects, null,
                     {'query': {method:'GET'}}),
               getProjectsAndCustomersByUserNameAndDateInterval:
                  $resource(queries.GET.EHOUR.getProjectsAndCustomersByUserNameAndDateInterval, null,
                     {'query': {method:'GET'}}),
               showTables:
                  $resource(queries.GET.EHOUR.showTables, null,
                     {'query': {method:'GET', isArray:true}}),
               getGiorni:
                  $resource(queries.GET.EHOUR.getGiorni, null,
                     {'query': {method:'GET'}}),
               getGiorniCliente:
                  $resource(queries.GET.EHOUR.getGiorniCliente, null,
                     {'query': {method:'GET'}}),
               getGiorniClienteProgetto:
                  $resource(queries.GET.EHOUR.getGiorniClienteProgetto, null,
                     {'query': {method:'GET'}}),
               getGiorniCommessa:
                  $resource(queries.GET.EHOUR.getGiorniCommessa, null,
                     {'query': {method:'GET'}}),
               getGiorniCommessaUtente:
                  $resource(queries.GET.EHOUR.getGiorniCommessaUtente, null,
                     {'query': {method:'GET'}}),
               getGiorniCommessaUtenteWithComments:
                  $resource(queries.GET.EHOUR.getGiorniCommessaUtenteWithComments, null,
                     {'query': {method:'GET'}}),
               getOreLavUtenteMese:
                  $resource(queries.GET.EHOUR.getOreLavUtenteMese, null,
                     {'query': {method:'GET'}})
            },
            HEREWEARE: {
               getCustomers:
                  $resource(queries.GET.HEREWEARE.getCustomers, null,
                     {'query': {method:'GET'}}),
               getProjectsInCustomers:
                  $resource(queries.GET.HEREWEARE.getProjectsInCustomers, null,
                     {'query': {method:'GET'}})
            }
         },
         PUT: {
            updateBudgets:
               $resource(queries.PUT.updateBudgets, null,
                  {'update': {method:'PUT'}})
         },
         POST: {
            saveProject:
               $resource(queries.POST.saveProject, null,
                  {'save': {method:'POST'}}),
            fsSave:
               $resource(queries.POST.fsSave, null,
                  {'save': {method:'POST'}}),
            saveEmployeeCosts:
               $resource(queries.POST.saveEmployeeCosts, null,
                  {'save': {method:'POST'}})
         }
      };

      var crud = {
         GET: {
            BOTH: {
               getBudgetsCostsByCustomerIds: function(params) {
                  return resources.GET.BOTH.getBudgetsCostsByCustomerIds.query(params).$promise;
               }
            },
            LOCAL: {
               getCustomersAndProjects: function(){
                  return resources.GET.LOCAL.getCustomersAndProjects.query().$promise;
               },
               getBudgets: function(projectId) {
                  return resources.GET.LOCAL.getBudgets.query(projectId).$promise;
               },
               fsBrowseDocs: function() {
                  return resources.GET.LOCAL.fsBrowseDocs.query().$promise;
               },
               getEmployeeCosts: function(params) {
                  return resources.GET.LOCAL.getEmployeeCosts.query(params).$promise;
               }
            },
            EHOUR: {
               getActiveUsers: function(){
                  return resources.GET.EHOUR.getActiveUsers.query().$promise;
               },
               getCustomers: function(customerParams){
                  return resources.GET.EHOUR.getCustomers.query(customerParams).$promise;
               },
               getProjectsByCustomerId: function(idObj) {
                  return resources.GET.EHOUR.getProjectsByCustomerId.query(idObj).$promise;
               },
               getProjectById: function(idObj) {
                  return resources.GET.EHOUR.getProjectById.query(idObj).$promise;
               },
               getCosts: function(projectCode) {
                  return resources.GET.EHOUR.getCosts.query(projectCode).$promise;
               },
               getReportsByUserNameAndDateIntervalAndProjects: function(params) {
                  return resources.GET.EHOUR.getReportsByUserNameAndDateIntervalAndProjects.query(params).$promise;
               },
               getProjectsAndCustomersByUserNameAndDateInterval: function(params) {
                  return resources.GET.EHOUR.getProjectsAndCustomersByUserNameAndDateInterval.query(params).$promise;
               },
               showTables: function() {
                  return resources.GET.EHOUR.showTables.query().$promise;
               },
               getGiorni: function(params) {
                  return resources.GET.EHOUR.getGiorni.query(params).$promise;
               },
               getGiorniCliente: function(params) {
                  return resources.GET.EHOUR.getGiorniCliente
                     .query(params).$promise;
               },
               getGiorniClienteProgetto: function(params) {
                  return resources.GET.EHOUR.getGiorniClienteProgetto
                     .query(params).$promise;
               },
               getGiorniCommessa: function(params) {
                  return resources.GET.EHOUR.getGiorniCommessa
                     .query(params).$promise;
               },
               getGiorniCommessaUtente: function(params) {
                  return resources.GET.EHOUR.getGiorniCommessaUtente
                     .query(params).$promise;
               },
               getGiorniCommessaUtenteWithComments: function(params) {
                  return resources.GET.EHOUR.getGiorniCommessaUtenteWithComments
                     .query(params).$promise;
               },
               getOreLavUtenteMese: function(params) {
                  return resources.GET.EHOUR.getOreLavUtenteMese
                     .query(params).$promise;
               }
            },
            HEREWEARE: {
               getCustomers: function(){
                  return resources.GET.HEREWEARE.getCustomers.query().$promise;
               },
               getProjectsInCustomers: function(){
                  return resources.GET.HEREWEARE.getProjectsInCustomers.query().$promise;
               }
            }
         },
         PUT: {
            updateBudgets: function(data){
               return resources.PUT.updateBudgets.update(data).$promise;
            }
         },
         POST: {
            saveProject: function(project){
               return resources.POST.saveProject.save(project).$promise;
            },
            fsSave: function(data){
               return resources.POST.fsSave.save(data).$promise;
            },
            saveEmployeeCosts: function(data) {
               return resources.POST.saveEmployeeCosts.save(data).$promise;
            }
         }
      };

		return crud;
	}]);

})(window, window.angular);
