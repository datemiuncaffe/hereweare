module.exports = function(options) {
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var logger = require('./../../lib/logger');

	return function queryProjectsByCustomerId(req, res, next) {
		// parse query string parameters
		var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams));

		if (queryparams.customerId != null && queryparams.customerId > 0) {
			logger.info('customerId: ' + queryparams.customerId);
			var query = 'select p.NAME as name, ' +
				'p.PROJECT_CODE as code, ' +
				'p.PROJECT_ID as id, ' +
				'p.PROJECT_MANAGER as managerId, ' +
				'u.FIRST_NAME as managerFirstName, ' +
				'u.LAST_NAME as managerName, ' +
				'u.EMAIL as managerEmail, ' +
				'p.CUSTOMER_ID as customerId ' +
				'FROM PROJECT p ' +
				'left join USERS u on u.USER_ID = p.PROJECT_MANAGER ' +
				'WHERE p.CUSTOMER_ID = \'' +
				queryparams.customerId + '\'';
			if (queryparams.onlyActive != null && queryparams.onlyActive == 'Y') {
				query += ' AND p.ACTIVE = \'y\';';
			} else {
				query += ';';
			}
			logger.info('query: ' + query);

			MysqlPool.getPool(getConnection);

			function getConnection() {
				MysqlPool.getConnection(getData, query);
			};

			function getData(err, connection, query) {
				connection.query(query, function(err, data) {
					if (err) {
						MysqlPool.releaseConnection(connection);
						throw err;
					}

					MysqlPool.releaseConnection(connection);
					logger.info('queryProjectsByCustomerId performed ...');
					logger.info('data: ' + JSON.stringify(data, null, '\t'));

					res.json(data);
				});
			};
			return res;
		} else {
			res.json([]);
			return res;
		}

	};
};
