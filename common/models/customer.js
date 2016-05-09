module.exports = function(Customer) {

//	Customer.observe('loaded', function(ctx, next) {
//		console.log('customer name: ', ctx.Customer.name);
//		next();
//	});
	
	Customer.autocompleteByName = function(name, cb) {
		console.log('name: ' + name);		
		if (name != null && name.length > 0) {
			console.log('autocomplete. name parameter = ' + name);
			
			Customer.find({where: {name: {like: '^' + name}}}, function (err, customers) {
				console.log('err: ' + err);
				if (err) {
					console.log('err: ' + err);
				}
				console.log('customers: ' + customers);
				cb(null, {customers: customers});
			});
		}		
	};
	
	Customer.remoteMethod(
		'autocompleteByName', 
		{
		  accepts:	[{arg: 'name', type: 'string'}],
		  returns: {arg: 'res', type: ['object']},
		  http: {path: '/autocompleteByName', verb: 'get'}
		}
	);
	
};