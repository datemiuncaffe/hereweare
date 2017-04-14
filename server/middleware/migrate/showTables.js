module.exports = function(options) {
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var logger = require('./../../lib/logger');

	return function showTables(req, res, next) {
		logger.info('starting show ehour tables ...');

		var query = 'SHOW TABLES;';

		MysqlPool.getPool(getConnection);

		function getConnection() {
			MysqlPool.getConnection(getData, query);
		};

		function getData(err, connection, query) {
			connection.query(query, function(err, tables) {
				if (err) {
					logger.info('err: ' + JSON.stringify(err));
					MysqlPool.releaseConnection(connection);
					throw err;
				}

				MysqlPool.releaseConnection(connection);

				logger.info('show tables performed ...');
				logger.info('tables: ' + JSON.stringify(tables, null, '\t'));

				var results = [];
				tables.forEach(function(table, index) {
					var resItem = {
						id:	index,
						name: table['Tables_in_ehour']
					};
					results.push(resItem);
				});

				res.json(results);
			});
		};

		return res;

	};
};
