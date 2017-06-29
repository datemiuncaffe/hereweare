module.exports = function(options) {
	var jp = require('jsonpath');
	var MysqlPool = require('./../../../lib/mysql-pool').pool();
	var logger = require('./../../../lib/logger');

	var filterParametersMap = {
		yearIn: 'year(ENTRY_DATE)',
		yearFin: 'year(ENTRY_DATE)',
		meseIn: 'month(ENTRY_DATE)',
		meseFin: 'month(ENTRY_DATE)',
		dayOfMonth: 'dayofmonth(ENTRY_DATE)',
		codiceProgetto: 'p.PROJECT_CODE',
		cognomeDipendente: 'u.LAST_NAME',
		nomeCliente: 'c.NAME',
		nomeDipendente: 'u.FIRST_NAME',
		nomeProgetto: 'p.NAME'
	};

	return function queryGiorniCommessaUtenteWithComments(req, res, next) {
		var resList = {
			giorniCommessaUtenteWithComments : []
		};
		// parse query string parameters
		var queryparams = req.query;
		logger.info('queryparams: ' +
			JSON.stringify(queryparams, null, '\t'));

		var query = 'select year(ENTRY_DATE) as anno, ' +
			'month(ENTRY_DATE) as mese, ' +
			'dayofmonth(ENTRY_DATE) as dayOfMonth, ' +
			'c.NAME as nomeCliente, concat(c.CODE, \' - \', c.NAME) as codiceNomeCliente, ' +
			'p.PROJECT_CODE as codiceProgetto, p.NAME as nomeProgetto, ' +
			'p.PROJECT_ID as idProgetto, ' +
			'u.FIRST_NAME as nomeDipendente, u.LAST_NAME as cognomeDipendente, ' +
			'concat(u.LAST_NAME, \', \', u.FIRST_NAME) as cognomeNomeDipendente, ' +
			'HOURS as oreMese, COMMENT as comment ' +
			'from TIMESHEET_ENTRY t ' +
			'join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID ' +
			'join PROJECT p on a.PROJECT_ID = p.PROJECT_ID ' +
			'join USERS u on u.USER_ID = a.USER_ID ' +
			'join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID';
		if (queryparams != null && queryparams.filter != null) {
			var keys = Object.keys(queryparams.filter);
			var keysNotInDate = keys.filter(function(key){
				return (key !== 'meseIn' && key !== 'meseFin' &&
						  key !== 'yearIn' && key !== 'yearFin' &&
						  key !== 'dayOfMonth');
			});
			var keysInDate = keys.filter(function(key){
				return (key == 'meseIn' || key == 'meseFin' ||
						  key == 'yearIn' || key == 'yearFin' ||
						  key == 'dayOfMonth');
			});
			query += ' where';
			if (keysNotInDate.length > 0) {
				for (var i = 0; i < keysNotInDate.length; i++) {
					query += ' ' + filterParametersMap[keysNotInDate[i]] +
							' like \'%' +
							queryparams.filter[keysNotInDate[i]] + '%\'';
					if (i !== (keysNotInDate.length - 1)) {
						query += ' and';
					}
				}
				for (var i = 0; i < keysInDate.length; i++) {
					query += ' and ' + filterParametersMap[keysInDate[i]];
					switch (keysInDate[i]) {
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
						case 'dayOfMonth':
							query += ' = ';
							break;
						default:
							query += ' error ';
							break;
					}
					query += queryparams.filter[keysInDate[i]];
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
						case 'dayOfMonth':
							query += ' = ';
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
			query += ' where ' +
							 filterParametersMap[yearIn] + ' = year(now())' +
							 ' and ' +
							 filterParametersMap[meseIn] + ' = month(now()) - 1';
		}
		// ordering
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
			sorting.codiceProgetto = 'ASC';
			sorting.dayOfMonth = 'ASC';
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
		logger.info('sql query: ' + JSON.stringify(query, null, '\t'));

		MysqlPool.getPool(getConnection);

		function getConnection() {
			MysqlPool.getConnection(getData, query);
		};

		function getData(err, connection, query) {
			connection.query(query, function(err, giorniCommessaUtenteWithComments) {
				if (err) {
					logger.info('err: ' + JSON.stringify(err));
					MysqlPool.releaseConnection(connection);
					throw err;
				}

				MysqlPool.releaseConnection(connection);
				logger.info('querygiorniCommessaUtenteWithComments performed ...');
				logger.info('giorniCommessaUtenteWithComments: ' +
					JSON.stringify(giorniCommessaUtenteWithComments, null, '\t'));

				resList['giorniCommessaUtenteWithComments'] = giorniCommessaUtenteWithComments;
				logger.info('resList: ' + JSON.stringify(resList));
				jp.apply(resList, '$.giorniCommessaUtenteWithComments[*].giornateMese', function(item) {
					logger.info('giornateMese: ' + item +
						'; typeof: ' + typeof item);
					if (item != null && typeof item == 'number') {
						var formattedItem = item.toString().replace(".", ",");
						logger.info('giornateMese formatted: ' + formattedItem);
						return formattedItem;
					}
				});
				jp.apply(resList, '$.giorniCommessaUtenteWithComments[*].oreMese', function(item) {
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
