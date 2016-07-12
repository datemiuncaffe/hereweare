module.exports = function(options) {
	var mysql = require("mysql");
	return function queryProjectsByCustomerId(req, res, next) {
		// First you need to create a connection to the db
		var con = mysql.createConnection({
			host : "192.168.88.158",
			user : "centos",
			database : "ehour"
		});

		// parse query string parameters
		var queryparams = req.query;
		console.log('queryparams: ' + JSON.stringify(queryparams));

		if (queryparams.customerId != null && queryparams.customerId > 0) {
			console.log('customerId: ' + queryparams.customerId);
			var query = 'select p.NAME as name, p.PROJECT_CODE as code, p.PROJECT_ID as id, p.CUSTOMER_ID as customerId ' +
									'FROM PROJECT p WHERE p.CUSTOMER_ID = \'' + queryparams.customerId + '\'';
			if (queryparams.onlyActive != null && queryparams.onlyActive == 'Y') {
				query += ' AND p.ACTIVE = \'y\';';
			} else {
				query += ';';
			}
			console.log('query: ' + query);
			con.query(query, function(err, data) {
				if (err) {
					throw err;
				}

				console.log('queryProjectsByCustomerId performed ...');
				console.log('data: ' + JSON.stringify(data, null, '\t'));

				res.json(data);
			});
			return res;
		} else {
			res.json([]);
			return res;
		}

	};
};
