module.exports = function(options) {
	var mysql = require("mysql");
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var logger = require('./../../lib/logger');

	return function queryReportsByUserNameAndDateInterval(req, res, next) {
		var query = 'select t.ENTRY_DATE as data, ' +
				'c.NAME as cliente, ' +
				'p.NAME as progetto, p.PROJECT_CODE as codiceProgetto, ' +
				'concat(u.LAST_NAME, \' - \', u.FIRST_NAME) as dipendente, ' +
				's.ROLE as ruolo, t.COMMENT as commento, t.HOURS as ore ' +
				'from TIMESHEET_ENTRY t ' +
				'join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID ' +
				'join PROJECT p on a.PROJECT_ID = p.PROJECT_ID ' +
				'join USERS u on u.USER_ID = a.USER_ID ' +
				'join USER_TO_USERROLE s on s.USER_ID = u.USER_ID ' +
				'join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID ';

		// parse query string parameters
		var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams, null, '\t'));

		if (queryparams.lastName == null ) {
			res.json([]);
		} else {
			query += 'where u.LAST_NAME = \'' + queryparams.lastName + '\'';
			if (queryparams.startDate != null ) {
				query += ' and t.ENTRY_DATE > \'' + queryparams.startDate + '\'';
			}
			if (queryparams.endDate != null ) {
				query += ' and t.ENTRY_DATE < \'' + queryparams.endDate + '\'';
			}
			query += ' order by t.ENTRY_DATE;';
			logger.info('sql query: ' + JSON.stringify(query, null, '\t'));
			MysqlPool.getConnection(getData, query);
		}

		function getData(err, connection, query) {
			connection.query(query, function(err, reports) {
				if (err) {
					logger.info('err: ' + JSON.stringify(err));
					MysqlPool.releaseConnection(connection);
					throw err;
				}

				MysqlPool.releaseConnection(connection);
				logger.info('queryReportsByUserNameAndDateInterval performed ...');
				logger.info('reports: ' +
					JSON.stringify(reports, null, '\t'));

				res.json(reports);
			});
		};

		return res;

	};
};
