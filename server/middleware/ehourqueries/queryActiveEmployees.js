module.exports = function(options) {
	var mysql = require("mysql");
	var logger = require('./../../lib/logger');

	return function queryActiveEmployees(req, res, next) {
		// First you need to create a connection to the db
		var con = mysql.createConnection({
			host : "192.168.88.158",
			user : "centos",
			database : "ehour"
		});

		con.query('select u.FIRST_NAME as nomeDipendente, ' +
							'u.LAST_NAME as cognomeDipendente, u.ACTIVE as active ' +
							'from USERS u where active = \'Y\' ORDER BY cognomeDipendente;',
							function(err, data) {
			var results = {activeEmployees: []};
			if (err) {
				logger.info('err: ' + JSON.stringify(err));
				results.error = JSON.stringify(err);
				con.end(function(err) {
					logger.info('ending connection' +
						' queryActiveEmployees not performed. err = ' + err);
				});
				res.json(results);
			}

			con.end(function(err) {
				logger.info('ending connection' +
					' after queryActiveEmployees. err = ' + err);
			});
			logger.info('queryActiveEmployees performed ...');
			logger.info('data: ' + JSON.stringify(data, null, '\t'));
			if (data != null && data.length > 0) {
				results.activeEmployees = data;
			}

			res.json(results);
		});
		return res;
	};
};
