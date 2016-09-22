module.exports = function(options) {
	var mysql = require("mysql");
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var logger = require('./../../lib/logger');

	return function queryGiorniCommessaUtente(req, res, next) {
		var resList = {
			giorniCommessaUtente : []
		};
		// parse query string parameters
		var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams, null, '\t'));

		var query = 'select year(ENTRY_DATE) as anno, month(ENTRY_DATE) as mese, ' +
			'c.NAME as nomeCliente, concat(c.CODE, \' - \', c.NAME) as codiceNomeCliente, ' +
			'p.PROJECT_CODE as codiceProgetto, p.NAME as nomeProgetto, ' +
			'u.FIRST_NAME as nomeDipendente, u.LAST_NAME as cognomeDipendente, ' + 
			'concat(u.LAST_NAME, \', \', u.FIRST_NAME) as cognomeNomeDipendente, ' +
			'round(sum(HOURS)/8,2) as giornateMese, sum(HOURS) as oreMese ' +
			'from TIMESHEET_ENTRY t join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID ' +
			'join PROJECT p on a.PROJECT_ID = p.PROJECT_ID ' +
			'join USERS u on u.USER_ID = a.USER_ID ' +
			'join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID ' +
			'group by anno, mese, c.CUSTOMER_ID, p.PROJECT_ID, u.USER_ID';
		if (queryparams != null && queryparams.filter != null) {
			query += ' having ';
			var keys = Object.keys(queryparams.filter);
			for (var i = 0; i < keys.length; i++) {
				query += keys[i] + ' like \'%' + queryparams.filter[keys[i]]
						+ '%\'';
				if (i !== (keys.length - 1)) {
					query += ' and ';
				}
			}
		} else {
			query += ' having anno = year(now()) and mese = month(now()) - 1';
		}
		query += ' order by c.CUSTOMER_ID, p.PROJECT_ID, u.LAST_NAME, anno, mese';
		logger.info('sql query: ' + JSON.stringify(query, null, '\t'));

		MysqlPool.getConnection(getData, query);

		function getData(err, connection, query) {
			connection.query(query, function(err, giorniCommessaUtente) {
				if (err) {
					logger.info('err: ' + JSON.stringify(err));
					MysqlPool.releaseConnection(connection);
					throw err;
				}

				MysqlPool.releaseConnection(connection);
				logger.info('queryGiorniCommessaUtente performed ...');
				logger.info('giorniCommessaUtente: ' + JSON.stringify(giorniCommessaUtente, null, '\t'));

				resList['giorniCommessaUtente'] = giorniCommessaUtente;
				logger.info('resList: ' + JSON.stringify(resList));
				res.json(resList);
			});
		};

		return res;

	};
};
