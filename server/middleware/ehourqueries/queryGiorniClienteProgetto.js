module.exports = function(options) {
	var mysql = require("mysql");
	var MysqlPool = require('./../../lib/mysql-pool').pool();

	return function queryGiorniClienteProgetto(req, res, next) {
		var resList = {
			giorniClienteProgetto : []
		};
		// parse query string parameters
		var queryparams = req.query;
		console.log('queryparams: ' + JSON.stringify(queryparams, null, '\t'));

		var query = 'select c.NAME as nomeCliente, p.PROJECT_CODE as codiceProgetto, p.NAME as nomeProgetto, round(sum(HOURS)/8,2) as giornateMese from TIMESHEET_ENTRY t join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID join PROJECT p on a.PROJECT_ID = p.PROJECT_ID join USERS u on u.USER_ID = a.USER_ID join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID group by c.CUSTOMER_ID, p.PROJECT_ID';
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
		query += ' order by c.CUSTOMER_ID, p.PROJECT_CODE';
		console.log('sql query: ' + JSON.stringify(query, null, '\t'));

		MysqlPool.getConnection(getData, query);

		function getData(connection, query) {
			connection.query(query, function(err, giorniClienteProgetto) {
				if (err) {
					console.log('err: ' + JSON.stringify(err));
					MysqlPool.releaseConnection(connection);
					throw err;
				}

				MysqlPool.releaseConnection(connection);
				console.log('queryGiorniClienteProgetto performed ...');
				console.log('giorni cliente progetto: ' + JSON.stringify(giorniClienteProgetto, null, '\t'));

				resList['giorniClienteProgetto'] = giorniClienteProgetto;
				console.log('resList: ' + JSON.stringify(resList));
				res.json(resList);
			});
		};
		
		return res;

	};
};
