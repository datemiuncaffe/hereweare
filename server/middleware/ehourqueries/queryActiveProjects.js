module.exports = function(options) {
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var logger = require('./../../lib/logger');

	return function queryActiveProjects(req, res, next) {
		var query = 'select c.CUSTOMER_ID as customerId, ' +
			'c.NAME as customerName, ' +
			'c.CODE as customerCode, c.ACTIVE as customerActive, ' +
			'p.PROJECT_ID as projectId, p.NAME as projectName, ' +
			'p.PROJECT_CODE as projectCode, ' +
			'p.ACTIVE as projectActive ' +
			'FROM PROJECT p ' +
			'join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID ' +
			'WHERE p.ACTIVE = \'y\';'

		MysqlPool.getPool(getConnection);

		function getConnection() {
			MysqlPool.getConnection(getData, query);
		};

		function getData(err, connection, query) {
			connection.query(query, function(err, data) {
				var results = {customers: []};
				if (err) {
					logger.info('err: ' + JSON.stringify(err));
					results.error = JSON.stringify(err);
					MysqlPool.releaseConnection(connection);
					res.json(results);
				}

				MysqlPool.releaseConnection(connection);
				logger.info('queryActiveProjects performed ...');
				logger.info('data: ' + JSON.stringify(data, null, '\t'));
				if (data != null && data.length > 0) {
					results.customers = data;
				}

				res.json(results);
			});
		};

		return res;
	};
};
