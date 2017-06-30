var MysqlPool = require('./../../../lib/mysql-pool').pool();
var logger = require('./../../../lib/logger');

module.exports = function(options) {

	return function queryProjectById(req, res, next) {
		// parse query string parameters
		var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams));

		if (queryparams.projectId != null && queryparams.projectId > 0) {
			logger.info('projectId: ' + queryparams.projectId);
			var query = 'select p.NAME as projectName, ' +
				'p.PROJECT_CODE as projectCode, p.PROJECT_ID as projectId, ' +
				'p.PROJECT_MANAGER as projectManagerId, ' +
				'c.CUSTOMER_ID as customerId, c.NAME as customerName ' +
				'FROM PROJECT p ' +
				'join CUSTOMER c on c.CUSTOMER_ID = p.CUSTOMER_ID ' +
				'WHERE p.PROJECT_ID = \'' + queryparams.projectId + '\'';
			query += ';';
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
					if (data.length > 1) {
						throw new Error('two projects with the same id');
					}

					MysqlPool.releaseConnection(connection);
					logger.info('queryProjectById performed ...');
					logger.info('data: ' + JSON.stringify(data, null, '\t'));

					res.json(data[0]);
				});
			};
			return res;
		} else {
			res.json({});
			return res;
		}

	};
};
