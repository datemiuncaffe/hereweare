module.exports = function(Customer) {

//	Customer.observe('loaded', function(ctx, next) {
//		logger.info('customer name: ', ctx.Customer.name);
//		next();
//	});
	var logger = require('./../../server/lib/logger');

	Customer.autocompleteByName = function(name, cb) {
		logger.info('name: ' + name);
		if (name != null && name.length > 0) {
			logger.info('autocomplete. name parameter = ' + name);

			Customer.find({where: {name: {like: '^' + name}}}, function (err, customers) {
				logger.info('err: ' + err);
				if (err) {
					logger.info('err: ' + err);
				}
				logger.info('customers: ' + customers);
				cb(null, customers);
			});
		}
	};

	Customer.remoteMethod(
		'autocompleteByName',
		{
		  accepts:	[{arg: 'name', type: 'string'}],
		  returns: {arg: 'customers', type: ['object']},
		  http: {path: '/autocompleteByName', verb: 'get'}
		}
	);

};
