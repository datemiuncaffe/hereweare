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
	module.factory('crud', ['$resource', 'resourceBaseUrl', 'CacheFactory',
                function($resource, resourceBaseUrl, CacheFactory) {
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
               getBudgetsCostsByCustomerIds: 'http://' + resourceBaseUrl +
                  '/query_budgets_costs_by_customer_ids'
            },
            LOCAL: {
               getCustomersAndProjects:	'http://' + resourceBaseUrl +
                  '/api/customers?filter[include][projects]=budgets',
               getBudgets: 'http://' + resourceBaseUrl + '/budgets-ops/budgets',
               fsBrowseDocs: 'http://' + resourceBaseUrl + '/browseDocs',
               getEmployeeCosts: 'http://' + resourceBaseUrl + '/redis-ops/users'
            },
            EHOUR: {
               getActiveUsers: 'http://' + resourceBaseUrl + '/query_active_users',
               getCustomers: 'http://' + resourceBaseUrl + '/query_customers',
               getProjectsByCustomerId: 'http://' + resourceBaseUrl +
                  '/query_projects_by_customer_id',
               getProjectById: 'http://' + resourceBaseUrl +
                  '/query_project_by_id',
               getCosts: 'http://' + resourceBaseUrl + '/query_costs',
               getReportsByUserNameAndDateIntervalAndProjects:
                  'http://' + resourceBaseUrl +
                  '/query_reports_by_username_dateinterval_projects',
               getProjectsAndCustomersByUserNameAndDateInterval:
                  'http://' + resourceBaseUrl +
                  '/query_projects_customers_by_username_dateinterval',
               showTables: 'http://' + resourceBaseUrl + '/migrate/show_tables'
            }
         },
         PUT: {
            updateBudgets: 'http://' + resourceBaseUrl +
               '/budgets-ops/update-all-by-project-id'
         },
         POST: {
            saveProject: 'http://' + resourceBaseUrl + '/projects-ops/save-project',
            fsSave: 'http://' + resourceBaseUrl + '/save',
            saveEmployeeCosts: 'http://' + resourceBaseUrl + '/redis-ops/save-users'
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
                     {'query':
                        {method:'GET',
                         isArray:true}
                     }),
               getBudgets:
                  $resource(queries.GET.LOCAL.getBudgets, null,
                     {'query':
                        {method:'GET'}
                     }),
               fsBrowseDocs:
                  $resource(queries.GET.LOCAL.fsBrowseDocs, null,
                     {'query':
                        {method:'GET'}
                     }),
               getEmployeeCosts:
                  $resource(queries.GET.LOCAL.getEmployeeCosts, null,
                     {'query':
                        {method:'GET'}
                     })
            },
            EHOUR: {
               getActiveUsers:
                  $resource(queries.GET.EHOUR.getActiveUsers, null,
                     {'query':
                        {method:'GET',
                         isArray:true}
                     }),
               getCustomers:
                  $resource(queries.GET.EHOUR.getCustomers, null,
                     {'query':
                        {method:'GET',
                         isArray:true}}),
               getProjectsByCustomerId:
                  $resource(queries.GET.EHOUR.getProjectsByCustomerId, null,
                     {'query':
                        {method:'GET',
                         isArray:true}}),
               getProjectById:
                  $resource(queries.GET.EHOUR.getProjectById, null,
                     {'query':
                        {method:'GET'}
                     }),
               getCosts:
                  $resource(queries.GET.EHOUR.getCosts, null,
                     {'query':
                        {method:'GET',
                         isArray:true}
                     }),
               getReportsByUserNameAndDateIntervalAndProjects:
                  $resource(queries.GET.EHOUR.getReportsByUserNameAndDateIntervalAndProjects, null,
                     {'query':
                        {method:'GET'}
                     }),
               getProjectsAndCustomersByUserNameAndDateInterval:
                  $resource(queries.GET.EHOUR.getProjectsAndCustomersByUserNameAndDateInterval, null,
                     {'query':
                        {method:'GET'}
                     }),
               showTables:
                  $resource(queries.GET.EHOUR.showTables, null,
                     {'query':
                        {method:'GET',
                         isArray:true}
                     })
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
