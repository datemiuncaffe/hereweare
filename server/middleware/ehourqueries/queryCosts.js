module.exports = function(options) {
	var jp = require('jsonpath');
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var logger = require('./../../lib/logger');

	return function queryCosts(req, res, next) {
		// parse query string parameters
		var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams));

		if (queryparams.projectId != null && queryparams.projectId > 0) {
			logger.info('project id: ' + queryparams.projectId);
			var query = 'select t.ASSIGNMENT_ID as id, ' +
				'year(ENTRY_DATE) as anno, month(ENTRY_DATE) as mese, ' +
				'c.NAME as nomeCliente, p.PROJECT_CODE as codiceProgetto, ' +
				'p.NAME as nomeProgetto, ' +
				'round(sum(HOURS)/8,2) as giornateMese, ' +
				'sum(HOURS) as oreMese from TIMESHEET_ENTRY t ' +
				'join PROJECT_ASSIGNMENT a ' +
				'on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID ' +
				'join PROJECT p on a.PROJECT_ID = p.PROJECT_ID ' +
				'join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID ' +
				'group by anno, mese, c.CUSTOMER_ID, p.PROJECT_ID ' +
				'having p.PROJECT_ID = \'' + queryparams.projectId +
				'\' order by anno, mese;'

			MysqlPool.getPool(getConnection);

			function getConnection() {
				MysqlPool.getConnection(getData, query);
			};

			function getData(err, connection, query) {
				connection.query(query, function(err, costs) {
					if (err) {
						MysqlPool.releaseConnection(connection);
						throw err;
					}

					MysqlPool.releaseConnection(connection);
					logger.info('queryCosts performed ...');
					logger.info('costs: ' + JSON.stringify(costs, null, '\t'));
					jp.apply(costs, '$[*].giornateMese', function(item) {
						logger.info('giornateMese: ' + item +
							'; typeof: ' + typeof item);
						if (item != null && typeof item == 'number') {
							var formattedItem = item.toString().replace(".", ",");
							logger.info('giornateMese formatted: ' + formattedItem);
							return formattedItem;
						}
					});
					jp.apply(costs, '$[*].oreMese', function(item) {
						logger.info('oreMese: ' + item +
							'; typeof: ' + typeof item);
						if (item != null && typeof item == 'number') {
							var formattedItem = item.toString().replace(".", ",");
							logger.info('oreMese formatted: ' + formattedItem);
							return formattedItem;
						}
					});
					res.json(costs);
				});
			};
			return res;
		} else {
			res.json([]);
			return res;
		}

	};
};
