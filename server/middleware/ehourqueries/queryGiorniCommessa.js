module.exports = function(options) {
	var mysql = require("mysql");
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	
	return function queryGiorniCommessa(req, res, next) {
		var resList = {
			giorniCommessa : []
		};
		// parse query string parameters
		var queryparams = req.query;
		console.log('queryparams: ' + JSON.stringify(queryparams, null, '\t'));

		var query = 'select year(ENTRY_DATE) as anno, month(ENTRY_DATE) as mese, c.NAME as nomeCliente, p.PROJECT_CODE as codiceProgetto, p.NAME as nomeProgetto, round(sum(HOURS)/8,2) as giornateMese from TIMESHEET_ENTRY t join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID join PROJECT p on a.PROJECT_ID = p.PROJECT_ID join USERS u on u.USER_ID = a.USER_ID join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID group by anno, mese, c.CUSTOMER_ID, p.PROJECT_ID';
		if (queryparams != null && queryparams.filter != null) {
			query += ' having ';
			var keys = Object.keys(queryparams.filter);
			for (var i = 0; i < keys.length; i++) {
				query += keys[i] + ' like \'%' + queryparams.filter[keys[i]] + '%\'';
				if (i !== (keys.length - 1)) {
					query += ' and ';
				}
			}
		} else {
			query += ' having anno = year(now()) and mese = month(now()) - 1';
		}
		query += ' order by c.CUSTOMER_ID, p.PROJECT_CODE';
		console.log('sql query: ' + JSON.stringify(query, null, '\t'));

		MysqlPool.getConnection(getData, query);

		function getData(connection, query) {
			connection.query(query, function(err, giorniCommessa) {
				if (err) {
					console.log('err: ' + JSON.stringify(err));
					MysqlPool.releaseConnection(connection);
					throw err;
				}

				MysqlPool.releaseConnection(connection);
				console.log('queryGiorniCommessa performed ...');
				console.log('giorniCommessa: ' + JSON.stringify(giorniCommessa, null, '\t'));

				resList['giorniCommessa'] = giorniCommessa;
				console.log('resList: ' + JSON.stringify(resList));
				res.json(resList);
			});
		};

		return res;

	};
};
