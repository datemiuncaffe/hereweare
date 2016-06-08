module.exports = function(options) {
	var mysql = require("mysql");
	return function queryGiorniClienteProgetto(req, res, next) {
		// First you need to create a connection to the db
		var con = mysql.createConnection({
			host : "192.168.88.158",
			user : "centos",
			database : "ehour"
		});

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

		con.query(query, function(err, giorniClienteProgetto) {
			if (err) {
				throw err;
			}

			console.log('queryGiorniClienteProgetto performed ...');
			console.log('giorni cliente progetto: ' + JSON.stringify(giorniClienteProgetto, null, '\t'));

			resList['giorniClienteProgetto'] = giorniClienteProgetto;
			console.log('resList: ' + JSON.stringify(resList));
			res.json(resList);
		});

		return res;

	};
};