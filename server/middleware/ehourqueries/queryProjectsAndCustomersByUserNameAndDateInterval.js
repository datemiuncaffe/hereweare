module.exports = function(options) {
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var logger = require('./../../lib/logger');

	return function queryProjectsAndCustomersByUserNameAndDateInterval(req, res, next) {
		logger.info('queryActiveProjectsByUserName');
		var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams));

		if (queryparams.username != null &&
				queryparams.username.length > 0 &&
				queryparams.startDate != null &&
				queryparams.startDate.length > 0 &&
				queryparams.endDate != null &&
				queryparams.endDate.length > 0) {
			var query = 'select DISTINCT p.PROJECT_CODE as projectCode, ' +
				'p.NAME as projectName, ' +
				'concat(p.PROJECT_CODE, \' - \', p.NAME) as projectCodeName, ' +
				'c.CODE as customerCode, ' +
				'c.NAME as customerName, ' +
				'concat(c.CODE, \' - \', c.NAME) as customerCodeName ' +
				'from TIMESHEET_ENTRY t ' +
				'join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID ' +
				'join PROJECT p on a.PROJECT_ID = p.PROJECT_ID ' +
				'join USERS u on u.USER_ID = a.USER_ID ' +
				'join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID ' +
				'where u.LAST_NAME = \'' + queryparams.username + '\' ' +
				'and t.ENTRY_DATE >= \'' + queryparams.startDate + '\' ' +
				'and t.ENTRY_DATE <= \'' + queryparams.endDate + '\' ' +
				'and p.ACTIVE = \'y\';';
			logger.info('sql query: ' + JSON.stringify(query, null, '\t'));

			MysqlPool.getPool(getConnection);

			function getConnection() {
				MysqlPool.getConnection(getData, query);
			};

			function getData(err, connection, query) {
				connection.query(query, function(err, data) {
					if (err) {
						logger.info('err: ' + JSON.stringify(err));
						MysqlPool.releaseConnection(connection);
						res.json([{err: err}]);
					} else {
						MysqlPool.releaseConnection(connection);
						logger.info('queryActiveProjectsByUserName performed ...');
						logger.info('data: ' +
							JSON.stringify(data, null, '\t'));
						var result = {
							customers: [],
							projects: []
						};
						getProjectsAndCustomers(data, result);
						res.json(result);
					}
				});
			};
		} else {
			res.json([{msg: "username, startDate, endDate required"}]);
		}

		return res;
	};

	function getProjectsAndCustomers(data, result) {
		data.forEach(function(item){
			logger.info('item: ' +
				JSON.stringify(item, null, '\t'));
			var project = {};
			var customer = {};
			project.projectCode = item.projectCode;
			project.projectName = item.projectName;
			project.projectCodeName = item.projectCodeName;
			result.projects.push(project);

			customer.customerCode = item.customerCode;
			customer.customerName = item.customerName;
			customer.customerCodeName = item.customerCodeName;

			var presentcustomer =
				getElemInArray(result.customers, customer);
			logger.info('presentcustomer: ' +
				JSON.stringify(presentcustomer, null, '\t'));

			if (presentcustomer.length === 0) {
				logger.info('length: ' + presentcustomer.length);
				result.customers.push(customer);
				customer.projects = [];
				customer.projects.push(result.projects.length - 1);
			} else {
				logger.info('length: ' + presentcustomer.length);
				presentcustomer[0].projects.push(result.projects.length - 1);
			}
			project.customer = result.customers.length - 1;

		});
	};

	function isInArray(customers, customer) {
		return customers.some(function(item){
			return (customer.customerCode == item.customerCode &&
							customer.customerName == item.customerName &&
							customer.customerCodeName == item.customerCodeName);
		});
	};

	function getElemInArray(customers, customer) {
		return customers.filter(function(item){
			return (customer.customerCode == item.customerCode &&
							customer.customerName == item.customerName &&
							customer.customerCodeName == item.customerCodeName);
		});
	};

};
