module.exports = function(options) {
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var logger = require('./../../lib/logger');

	return function queryActiveCustomers(req, res, next) {
		var query = 'select DISTINCT c.CUSTOMER_ID, c.NAME as name ' +
					'from CUSTOMER c ' +
					'join PROJECT p on p.CUSTOMER_ID = c.CUSTOMER_ID ' +
					'WHERE p.ACTIVE = \'y\' ORDER BY c.NAME;';

		MysqlPool.getPool(getConnection);

		function getConnection() {
			MysqlPool.getConnection(getData, query);
		};
		function getData(err, connection, query) {
			connection.query(query, function(err, data) {
				var results = {activeCustomers: []};
				if (err) {
					logger.info('err: ' + JSON.stringify(err));
					results.error = JSON.stringify(err);
					MysqlPool.releaseConnection(connection);
					res.json(results);
				}

				MysqlPool.releaseConnection(connection);
				logger.info('queryActiveCustomers performed ...');
				logger.info('data: ' + JSON.stringify(data, null, '\t'));
				if (data != null && data.length > 0) {
					results.activeCustomers = data;
				}

				res.json(results);
			});
		};

		return res;
	};
};
