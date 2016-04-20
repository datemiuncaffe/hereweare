var async = require('async');
module.exports = function(app) {
	console.log('init script for generating models...');
  //data sources
  var mongoDs = app.dataSources.mongoDs;
  
  //create all models
  async.parallel({
	customers: async.apply(createCustomers),
//	budgets: async.apply(createBudgets)
//	customers: async.apply(createCustomers, function(err, customers) {
//	      if (err) throw err;   	 
//	      console.log('Customers created: \n', customers);
//	}),
//	budgets: async.apply(createBudgets, function(err, budgets) {
//	      if (err) throw err;   	 
//	      console.log('Budgets created: \n', budgets);
//	})
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
		{id: 1, month: 'GEN', amount: 10000, type: 'Y', projectId: project.id},
		{id: 2, month: 'FEB', amount: 2000, type: 'M', projectId: project.id},
		{id: 3, month: 'MAR', amount: 3000, type: 'M', projectId: project.id}
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
  		{id: '2', name: 'Supporto Manzoni', code: 'CF12001', customerId: customer.id},
		{id: '4', name: 'Configuratore 1', code: 'CF11015', customerId: customer.id},
		{id: '5', name: 'CF11001', code: 'CF11001', customerId: customer.id},
		{id: '6', name: 'Gestione Credito 1', code: 'CF12903', customerId: customer.id},
		{id: '7', name: 'Gestione Credito 2', code: 'CF12904', customerId: customer.id},
		{id: '8', name: 'Cosuntivo 10/2012', code: 'CF12901', customerId: customer.id}
	      ], cb);
    });
  }
};