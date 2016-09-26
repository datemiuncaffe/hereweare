module.exports = function(options) {
	var mysql = require("mysql");
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var logger = require('./../../lib/logger');

	return function queryActiveEmployees(req, res, next) {
		var query = 'select u.FIRST_NAME as nomeDipendente, ' +
				'u.LAST_NAME as cognomeDipendente, ' +
				'concat(u.LAST_NAME, \' - \', u.FIRST_NAME) ' +
				'as cognomeNomeDipendente, ' +
				'u.ACTIVE as active ' +
				'from USERS u where active = \'Y\' ORDER BY cognomeDipendente;'
		logger.info('sql query: ' + JSON.stringify(query, null, '\t'));

		MysqlPool.getConnection(getData, query);

		function getData(err, connection, query) {
			connection.query(query, function(err, activeEmployees) {
				if (err) {
					logger.info('err: ' + JSON.stringify(err));
					MysqlPool.releaseConnection(connection);
					throw err;
				}

				MysqlPool.releaseConnection(connection);
				logger.info('queryActiveEmployees performed ...');
				logger.info('activeEmployees: ' +
					JSON.stringify(activeEmployees, null, '\t'));

				res.json(activeEmployees);
			});
		};

		return res;

	};
};
