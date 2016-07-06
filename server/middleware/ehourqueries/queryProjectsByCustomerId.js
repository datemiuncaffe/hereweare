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

			con.query('select p.NAME as name, p.PROJECT_CODE as code, p.PROJECT_ID as id, p.CUSTOMER_ID as customerId FROM PROJECT p WHERE p.CUSTOMER_ID = \''
						+ queryparams.customerId + '\';',
				function(err, data) {
					if (err) {
						throw err;
					}

					console.log('queryProjectsByCustomerId performed ...');
					console.log('data: ' + JSON.stringify(data, null, '\t'));

					// var projects = [];
					// data.forEach(function(d){
					// 	var project = {};
					// 	project.id = d.id;
					// 	project.name = d.name;
					// 	project.code = d.code;
					// 	project.from = null;
					// 	project.to = null;
					// 	project.budgettot = null;
					// 	project.daystot = null;
					// 	project.customerId = d.customerId;
					// 	projects.push(project);
					// });

					res.json(data);
				});
			return res;
		} else {
			res.json([]);
			return res;
		}

	};
};
