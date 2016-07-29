module.exports = function(options) {
	var mysql = require("mysql");
	return function queryActiveCustomers(req, res, next) {
		// First you need to create a connection to the db
		var con = mysql.createConnection({
			host : "192.168.88.158",
			user : "centos",
			database : "ehour"
		});

		con.query('select DISTINCT c.CUSTOMER_ID, c.NAME as name from CUSTOMER c join PROJECT p on p.CUSTOMER_ID = c.CUSTOMER_ID WHERE p.ACTIVE = \'y\' ORDER BY c.NAME;', function(err, data) {
			var results = {activeCustomers: []};
			if (err) {
				console.log('err: ' + JSON.stringify(err));
				results.error = JSON.stringify(err);
				con.end(function(err) {
					console.log('ending connection queryActiveCustomers not performed. err = ' + err);
				});
				res.json(results);
			}

			con.end(function(err) {
				console.log('ending connection after queryActiveCustomers. err = ' + err);
			});
			console.log('queryActiveCustomers performed ...');
			console.log('data: ' + JSON.stringify(data, null, '\t'));
			if (data != null && data.length > 0) {
				results.activeCustomers = data;
			}

			res.json(results);
		});
		return res;
	};
};
