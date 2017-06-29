module.exports = function(options) {
	var jp = require('jsonpath');
	var MysqlPool = require('./../../../lib/mysql-pool').pool();
	var logger = require('./../../../lib/logger');

	return function queryGiorniClienteProgetto(req, res, next) {
		var resList = {
			giorniClienteProgetto : []
		};
		// parse query string parameters
		var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams, null, '\t'));

		var query = 'select c.NAME as nomeCliente, p.PROJECT_CODE as codiceProgetto, ' +
			'p.PROJECT_ID as idProgetto, ' +
			'p.NAME as nomeProgetto, round(sum(HOURS)/8,2) as giornateMese ' +
			'from TIMESHEET_ENTRY t ' +
			'join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID ' +
			'join PROJECT p on a.PROJECT_ID = p.PROJECT_ID ' +
			'join USERS u on u.USER_ID = a.USER_ID ' +
			'join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID ' +
			'group by c.CUSTOMER_ID, p.PROJECT_ID';
		if (queryparams != null && queryparams.filter != null) {
			query += ' having ';
			var keys = Object.keys(queryparams.filter);
			for (var i = 0; i < keys.length; i++) {
				query += keys[i] + ' like \'%' + queryparams.filter[keys[i]] + '%\'';
				if (i !== (keys.length - 1)) {
					query += ' and ';
				}
			}
		}

		/* -------------------- sorting ------------------------ */
		var sorting = {
			nomeCliente: 'ASC',
			codiceProgetto: 'ASC'
		};
		if (queryparams != null && queryparams.sorting != null) {
			var sortingParamskeys = Object.keys(queryparams.sorting);
			sortingParamskeys.forEach(function(key) {
				sorting[key] = queryparams.sorting[key];
			});
		}
		logger.info('sorting: ' + JSON.stringify(sorting, null, '\t'));
		query += ' order by ';
		var sortingkeys = Object.keys(sorting);
		for (var i = 0; i < sortingkeys.length; i++) {
			query += sortingkeys[i] + ' ' + sorting[sortingkeys[i]];
			if (i !== (sortingkeys.length - 1)) {
				query += ', ';
			}
		}
		/* ------------------ end sorting ---------------------- */

		logger.info('sql query: ' + JSON.stringify(query, null, '\t'));

		MysqlPool.getPool(getConnection);

		function getConnection() {
			MysqlPool.getConnection(getData, query);
		};

		function getData(err, connection, query) {
			connection.query(query, function(err, giorniClienteProgetto) {
				if (err) {
					logger.info('err: ' + JSON.stringify(err));
					MysqlPool.releaseConnection(connection);
					throw err;
				}

				MysqlPool.releaseConnection(connection);
				logger.info('queryGiorniClienteProgetto performed ...');
				logger.info('giorni cliente progetto: ' + JSON.stringify(giorniClienteProgetto, null, '\t'));

				resList['giorniClienteProgetto'] = giorniClienteProgetto;
				logger.info('resList: ' + JSON.stringify(resList));
				jp.apply(resList, '$.giorniClienteProgetto[*].giornateMese', function(item) {
					logger.info('giornateMese: ' + item +
						'; typeof: ' + typeof item);
					if (item != null && typeof item == 'number') {
						var formattedItem = item.toString().replace(".", ",");
						logger.info('giornateMese formatted: ' + formattedItem);
						return formattedItem;
					}
				});
				res.json(resList);
			});
		};

		return res;

	};
};
