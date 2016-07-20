module.exports = function(options) {
	var mysql = require("mysql");
	return function queryCustomers(req, res, next) {
		// First you need to create a connection to the db
		var con = mysql.createConnection({
			host : "192.168.88.158",
			user : "centos",
			database : "ehour"
		});

		var queries = {
			ALL: 'SELECT c.NAME as name, c.CODE as code, c.CUSTOMER_ID as id FROM CUSTOMER c ORDER BY name;',
			INT: 'SELECT c.NAME as name, c.CODE as code, c.CUSTOMER_ID as id FROM CUSTOMER c WHERE code IN (\'ASS\',\'SEN\') ORDER BY name;',
			EXT: 'SELECT c.NAME as name, c.CODE as code, c.CUSTOMER_ID as id FROM CUSTOMER c WHERE code NOT IN (\'ASS\',\'SEN\') ORDER BY name;',
			NOTACTIVE: '',
			ACTIVE: 'select DISTINCT c.CUSTOMER_ID as id, c.NAME as name FROM PROJECT p join PROJECT_ASSIGNMENT a on p.PROJECT_ID = a.PROJECT_ID join TIMESHEET_ENTRY t on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID WHERE t.ENTRY_DATE > \'2016-05-01\' AND p.CUSTOMER_ID NOT IN (4,8) ORDER BY name;',
			NEW: 'select DISTINCT c.CUSTOMER_ID as id, c.NAME as name FROM PROJECT p join PROJECT_ASSIGNMENT a on p.PROJECT_ID = a.PROJECT_ID join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID WHERE a.DATE_START > \'2016-05-01\' AND p.CUSTOMER_ID NOT IN (4,8) ORDER BY name;'
		};

		// parse query string parameters
		var queryparams = req.query;
		console.log('queryparams: ' + JSON.stringify(queryparams));

		var query = queries.ALL;
		if (queryparams.customerGroup != null) {
			if (queryparams.customerGroup == 'INT') {
				query = queries.INT;
			} else if (queryparams.customerGroup == 'EXT') {
				query = queries.EXT;
			} else if (queryparams.customerGroup == 'ACTIVE') {
				query = queries.ACTIVE;
			} else if (queryparams.customerGroup == 'NOTACTIVE') {
				query = queries.NOTACTIVE;
			} else if (queryparams.customerGroup == 'NEW') {
				query = queries.NEW;
			}
		}

		con.query(query, function(err, customers) {
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
