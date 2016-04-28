var async = require('async');
module.exports = function(app) {
	console.log('init script for generating models...');
  //data sources
  var mongoDs = app.dataSources.mongoDs;
  
  //create all models
  async.parallel({
	customers: async.apply(createCustomers),
  }, function(err, results) {
	  console.log('Results: \n', results);
    if (err) {
    	throw err;
    }
    var customer = results.customers[0];
    console.log('customer: ' + customer);
    createProjects(customer, function(err, projects) {
        if (err) throw err;
        
        console.log('project: ' + JSON.stringify(projects[0]));
        createBudgets(projects[0], function(err, budgets) {
        	console.log('Budgets created: \n', budgets);
        });
                
        console.log('Projects created: \n', projects);
    });
  });
  //create customers
  function createCustomers(cb) {
    mongoDs.automigrate('Customer', function(err) {
      if (err) { 
    	  throw err;
      }
      var Customer = app.models.Customer;
      Customer.create([
		{id: '1', name: 'Manzoni'},
		{id: '2', name: 'Idea'},
		{id: '3', name: 'Elmedia'},
		{id: '4', name: 'Sensei'},
		{id: '5', name: 'Cobra'},
		{id: '6', name: 'Climate'}
	    ], cb);
    });
  }
  //create budgets
  function createBudgets(project, cb) {
	  console.log('createBudgets...');
    mongoDs.automigrate('Budget', function(err) {
      if (err) { 
    	  return cb(err);
      }
      var Budget = app.models.Budget;
      Budget.create([
		{month: 'GEN', days: 30, amount: 10000, projectId: project.id},
		{month: 'FEB', days: 40, amount: 2000, projectId: project.id},
		{month: 'MAR', days: 50, amount: 3000, projectId: project.id}
		], cb);
    });
  }
  
  
  //create projects
  function createProjects(customer, cb) {
    mongoDs.automigrate('Project', function(err) {
      if (err) {
    	  return cb(err);
      }
      var Project = app.models.Project;
      Project.create([
  		{name: 'Supporto Manzoni', code: 'CF12001', budgettot: 2000, customerId: customer.id},
		{name: 'Configuratore 1', code: 'CF11015', budgettot: 3000, customerId: customer.id},
		{name: 'CF11001', code: 'CF11001', budgettot: 4000, customerId: customer.id},
		{name: 'Gestione Credito 1', code: 'CF12903', budgettot: 5000, customerId: customer.id},
		{name: 'Gestione Credito 2', code: 'CF12904', budgettot: 6000, customerId: customer.id},
		{name: 'Cosuntivo 10/2012', code: 'CF12901', budgettot: 7000, customerId: customer.id}
	      ], cb);
    });
  }
};