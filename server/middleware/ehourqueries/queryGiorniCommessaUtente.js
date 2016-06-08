module.exports = function(options) {
	var mysql = require("mysql");
	return function queryGiorniCommessaUtente(req, res, next) {
		// First you need to create a connection to the db
		var con = mysql.createConnection({
			host : "192.168.88.158",
			user : "centos",
			database : "ehour"
		});

		var resList = {
			giorni : []
		};
		// parse query string parameters
		var queryparams = req.query;
		console.log('queryparams: ' + JSON.stringify(queryparams, null, '\t'));

		var query = 'select year(ENTRY_DATE) as anno, month(ENTRY_DATE) as mese, c.NAME as nomeCliente, p.PROJECT_CODE as codiceProgetto, p.NAME as nomeProgetto, u.LAST_NAME as nomeDipendente, round(sum(HOURS)/8,2) as giornateMese from TIMESHEET_ENTRY t join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID join PROJECT p on a.PROJECT_ID = p.PROJECT_ID join USERS u on u.USER_ID = a.USER_ID join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID group by anno, mese, c.CUSTOMER_ID, p.PROJECT_ID, u.USER_ID';
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
		console.log('sql query: ' + JSON.stringify(query, null, '\t'));

		con.query(query, function(err, giorni) {
			if (err) {
				throw err;
			}

			console.log('queryGiorniCommessaUtente performed ...');
			console.log('giorni: ' + JSON.stringify(giorni, null, '\t'));

			resList['giorni'] = giorni;
			console.log('resList: ' + JSON.stringify(resList));
			res.json(resList);
		});

		return res;

	};
};