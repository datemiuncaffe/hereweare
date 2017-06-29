module.exports = function(options) {
	var jp = require('jsonpath');
	var MysqlPool = require('./../../../lib/mysql-pool').pool();
	var logger = require('./../../../lib/logger');

	var filterParametersMap = {
		yearIn: 'anno',
		yearFin: 'anno',
		meseIn: 'mese',
		meseFin: 'mese'
	};

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
			var keys = Object.keys(queryparams.filter);
			var keysWithoutMeseAndAnno = keys.filter(function(key){
				return (key !== 'meseIn' && key !== 'meseFin' &&
						  key !== 'yearIn' && key !== 'yearFin');
			});
			var keysMeseAndAnno = keys.filter(function(key){
				return (key == 'meseIn' || key == 'meseFin' ||
						  key == 'yearIn' || key == 'yearFin');
			});
			query += ' having';
			if (keysWithoutMeseAndAnno.length > 0) {
				for (var i = 0; i < keysWithoutMeseAndAnno.length; i++) {
					query += ' ' + keysWithoutMeseAndAnno[i] + ' like \'%' +
							queryparams.filter[keysWithoutMeseAndAnno[i]] + '%\'';
					if (i !== (keysWithoutMeseAndAnno.length - 1)) {
						query += ' and';
					}
				}
				for (var i = 0; i < keysMeseAndAnno.length; i++) {
					query += ' and ' + filterParametersMap[keysMeseAndAnno[i]];
					switch (keysMeseAndAnno[i]) {
						case 'yearIn':
							query += ' >= ';
							break;
						case 'yearFin':
							query += ' <= ';
							break;
						case 'meseIn':
							query += ' >= ';
							break;
						case 'meseFin':
							query += ' <= ';
							break;
						default:
							query += ' error ';
							break;
					}
					query += queryparams.filter[keysMeseAndAnno[i]];
				}
			} else {
				for (var i = 0; i < keys.length; i++) {
					query += ' ' + filterParametersMap[keys[i]];
					switch (keys[i]) {
						case 'yearIn':
							query += ' >= ';
							break;
						case 'yearFin':
							query += ' <= ';
							break;
						case 'meseIn':
							query += ' >= ';
							break;
						case 'meseFin':
							query += ' <= ';
							break;
						default:
							query += ' error ';
							break;
					}
					query += queryparams.filter[keys[i]];
					if (i !== (keys.length - 1)) {
						query += ' and';
					}
				}
			}
		} else {
			query += ' having ' +
							 filterParametersMap[yearIn] + ' = year(now())' +
							 ' and ' +
							 filterParametersMap[meseIn] + ' = month(now()) - 1';
		}

		/* -------------------- sorting ------------------------ */
		var sorting = {
			anno: 'ASC',
			mese: 'ASC'
		};
		if (queryparams != null && queryparams.sorting != null) {
			var sortingParamskeys = Object.keys(queryparams.sorting);
			sortingParamskeys.forEach(function(key) {
				sorting[key] = queryparams.sorting[key];
			});
		}
		if (Object.keys(sorting).length == 2) {
			sorting.cognomeDipendente = 'ASC';
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
				jp.apply(resList, '$.giorniCommessaUtente[*].giornateMese', function(item) {
					logger.info('giornateMese: ' + item +
						'; typeof: ' + typeof item);
					if (item != null && typeof item == 'number') {
						var formattedItem = item.toString().replace(".", ",");
						logger.info('giornateMese formatted: ' + formattedItem);
						return formattedItem;
					}
				});
				jp.apply(resList, '$.giorniCommessaUtente[*].oreMese', function(item) {
					logger.info('oreMese: ' + item +
						'; typeof: ' + typeof item);
					if (item != null && typeof item == 'number') {
						var formattedItem = item.toString().replace(".", ",");
						logger.info('oreMese formatted: ' + formattedItem);
						return formattedItem;
					}
				});
				res.json(resList);
			});
		};

		return res;

	};
};
