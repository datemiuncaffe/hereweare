module.exports = function(options) {
	var mysql = require("mysql");
	return function queryCustomers(req, res, next) {
		// First you need to create a connection to the db
		var con = mysql.createConnection({
			host : "192.168.88.158",
			user : "centos",
			database : "ehour"
		});

		con.query('select c.NAME as name, c.CUSTOMER_ID as id FROM CUSTOMER c order by name;',
			function(err, customers) {
				if (err) {
					con.end(function(err) {
						console.log('ending connection queryCustomers not performed. err = ' + err);
					});
					throw err;
				}

				con.end(function(err) {
					console.log('ending connection after queryCustomers. err = ' + err);
				});
				console.log('queryCustomers performed ...');
				console.log('customers: ' + JSON.stringify(customers, null, '\t'));

				res.json(customers);
			});
		return res;

	};
};
