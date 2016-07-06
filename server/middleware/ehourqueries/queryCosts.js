module.exports = function(options) {
	var mysql = require("mysql");
	return function queryCosts(req, res, next) {
		// First you need to create a connection to the db
		var con = mysql.createConnection({
			host : "192.168.88.158",
			user : "centos",
			database : "ehour"
		});

		// parse query string parameters
		var queryparams = req.query;
		console.log('queryparams: ' + JSON.stringify(queryparams));

		if (queryparams.projectCode != null && queryparams.projectCode.length > 0) {
			console.log('project code: ' + queryparams.projectCode);

			con.query('select t.ASSIGNMENT_ID as id, year(ENTRY_DATE) as anno, month(ENTRY_DATE) as mese, c.NAME as nomeCliente, p.PROJECT_CODE as codiceProgetto, p.NAME as nomeProgetto, round(sum(HOURS)/8,2) as giornateMese from TIMESHEET_ENTRY t join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID join PROJECT p on a.PROJECT_ID = p.PROJECT_ID join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID group by anno, mese, c.CUSTOMER_ID, p.PROJECT_ID having codiceProgetto = \''
						+ queryparams.projectCode + '\' order by anno, mese;',
				function(err, costs) {
					if (err) {
						throw err;
					}

					console.log('queryCosts performed ...');
					console.log('costs: ' + JSON.stringify(costs, null, '\t'));

					res.json(costs);
				});
			return res;
		} else {
			res.json([]);
			return res;
		}

	};
};
