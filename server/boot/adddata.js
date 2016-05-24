module.exports = function(app) {
	console.log('add data on startup ...');
	
	var mongoSequence = require('./../lib/mongo-sequences');
	
	// data sources model	
	var Customer = app.models.Customer;
	
	// sequence
	var connector = app.dataSources.mongoDs.connector;
	if (typeof connector.connect == 'function') {
		console.log('connector: ' + JSON.stringify(connector.connect));
		connector.connect(function(err, db){
			if (err) {
				throw err;
			}
			console.log('db: ' + db);
			var customerseq = mongoSequence(db,'customers');
			customerseq.getNext(function(err, sequence) {
				console.log('customerseq name: ' + customerseq.name + '; no: ' + sequence);
				if (!err) {
					console.log('insert customer Mongo');
					Customer.create({
						id : sequence,
						name : 'Mongo'
					}, function(err, customer) {
						if (err) {
							throw err;
						}
						console.log('Customer created: \n', customer);
					});
				}
			});			
		});
	}
			
//	var _ = require('glutils');
//	  //... within a fiber thread at this point
//	  if (!err) {
//	    db.employees.insert(
//	      {
//	        _id: _.p(empseq.getNext(_.p())),
//	        name: "Sarah C."
//	      }
//	    )
//	  }	
	
};