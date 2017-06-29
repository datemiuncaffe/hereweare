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
	
	return function queryGiorniCliente(req, res, next) {
		var resList = {
			giorniCliente : []
		};
		// parse query string parameters
		var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams, null, '\t'));

		var query = 'select year(ENTRY_DATE) as anno, month(ENTRY_DATE) as mese, ' +
			'c.CUSTOMER_ID as idCliente, c.NAME as nomeCliente, ' +
			'round(sum(HOURS)/8,2) as giornateMese ' +
			'from TIMESHEET_ENTRY t ' +
			'join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID ' +
			'join PROJECT p on a.PROJECT_ID = p.PROJECT_ID ' +
			'join USERS u on u.USER_ID = a.USER_ID ' +
			'join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID ' +
			'group by anno, mese, c.CUSTOMER_ID';
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
			query += ' having ';
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
			query += ' having anno = year(now()) and mese = month(now()) - 1';
		}


		/* ----------------- sorting --------------------- */
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
		logger.info('sorting: ' + JSON.stringify(sorting, null, '\t'));
		query += ' order by ';
		var sortingkeys = Object.keys(sorting);
		for (var i = 0; i < sortingkeys.length; i++) {
			query += sortingkeys[i] + ' ' + sorting[sortingkeys[i]];
			if (i !== (sortingkeys.length - 1)) {
				query += ', ';
			}
		}
		/* ------------------ end sorting --------------------- */

		logger.info('sql query: ' + JSON.stringify(query, null, '\t'));

		MysqlPool.getPool(getConnection);

		function getConnection() {
			MysqlPool.getConnection(getData, query);
		};

		function getData(err, connection, query) {
			connection.query(query, function(err, giorniCliente) {
				if (err) {
					logger.info('err: ' + JSON.stringify(err));
					MysqlPool.releaseConnection(connection);
					throw err;
				}

				MysqlPool.releaseConnection(connection);
				logger.info('queryGiorniCliente performed ...');
				logger.info('giorniCliente: ' + JSON.stringify(giorniCliente, null, '\t'));

				resList['giorniCliente'] = giorniCliente;
				logger.info('resList: ' + JSON.stringify(resList));
				jp.apply(resList, '$.giorniCliente[*].giornateMese', function(item) {
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
