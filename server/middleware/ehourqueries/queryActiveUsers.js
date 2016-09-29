module.exports = function(options) {
	var mysql = require("mysql");
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var logger = require('./../../lib/logger');

	return function queryActiveUsers(req, res, next) {
		var query = 'select u.FIRST_NAME as nomeDipendente, ' +
				'u.LAST_NAME as cognomeDipendente, ' +
				'concat(u.LAST_NAME, \' - \', u.FIRST_NAME) ' +
				'as cognomeNomeDipendente, ' +
				'u.ACTIVE as active ' +
				'from USERS u where u.ACTIVE = \'Y\' ' +
				'and u.LAST_NAME != \'Admin\' ' +
				'ORDER BY cognomeDipendente;'
		logger.info('sql query: ' + JSON.stringify(query, null, '\t'));

		MysqlPool.getConnection(getData, query);

		function getData(err, connection, query) {
			connection.query(query, function(err, activeUsers) {
				if (err) {
					logger.info('err: ' + JSON.stringify(err));
					MysqlPool.releaseConnection(connection);
					throw err;
				}

				MysqlPool.releaseConnection(connection);
				logger.info('queryActiveUsers performed ...');
				logger.info('activeUsers: ' +
					JSON.stringify(activeUsers, null, '\t'));

				res.json(activeUsers);
			});
		};

		return res;

	};
};
