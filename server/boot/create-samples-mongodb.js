var async = require('async');
module.exports = function(app) {
	console.log('init script for generating models...');
  //data sources
  var mongoDs = app.dataSources.mongoDs;
  
  //create all models
  async.parallel({
	customers: async.apply(createCustomers),
	budgets: async.apply(createBudgets)
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
    createProjects(results.customers, function(err, projects) {
        if (err) throw err; 	   
        console.log('Models created: \n', projects);
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
  function createBudgets(cb) {
    mongoDs.automigrate('Budget', function(err) {
      if (err) { 
    	  return cb(err);
      }
      var Budget = app.models.Budget;
      Budget.create([
		{id: 1, from: new Date(), to: new Date(), amount: 10000, type: 'Y'},
		{id: 2, from: new Date(), to: new Date(), amount: 2000, type: 'M'},
		{id: 3, from: new Date(), to: new Date(), amount: 3000, type: 'M'}
	    ], cb);
    });
  }
  
  
  //create projects
  function createProjects(customers, cb) {
    mongoDs.automigrate('Project', function(err) {
      if (err) {
    	  return cb(err);
      }
      var Project = app.models.Project;
      Project.create([
  		{id: '2', name: 'Supporto Manzoni', code: 'CF12001'},
		{id: '4', name: 'Configuratore 1', code: 'CF11015'},
		{id: '5', name: 'CF11001', code: 'CF11001'},
		{id: '6', name: 'Gestione Credito 1', code: 'CF12903'},
		{id: '7', name: 'Gestione Credito 2', code: 'CF12904'},
		{id: '8', name: 'Cosuntivo 10/2012', code: 'CF12901'}
	      ], cb);
    });
  }
};