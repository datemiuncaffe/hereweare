module.exports = function(options) {
	var mysql = require("mysql");
	var logger = require('./../../lib/logger');
	
	return function queryProjectsByCustomerId(req, res, next) {
		// First you need to create a connection to the db
		var con = mysql.createConnection({
			host : "192.168.88.158",
			user : "centos",
			database : "ehour"
		});

		// parse query string parameters
		var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams));

		if (queryparams.customerId != null && queryparams.customerId > 0) {
			logger.info('customerId: ' + queryparams.customerId);
			var query = 'select p.NAME as name, p.PROJECT_CODE as code, p.PROJECT_ID as id, p.CUSTOMER_ID as customerId ' +
									'FROM PROJECT p WHERE p.CUSTOMER_ID = \'' + queryparams.customerId + '\'';
			if (queryparams.onlyActive != null && queryparams.onlyActive == 'Y') {
				query += ' AND p.ACTIVE = \'y\';';
			} else {
				query += ';';
			}
			logger.info('query: ' + query);
			con.query(query, function(err, data) {
				if (err) {
					con.end(function(err) {
					  logger.info('ending connection queryProjectsByCustomerId not performed. err = ' + err);
					});
					throw err;
				}

				con.end(function(err) {
					logger.info('ending connection after queryProjectsByCustomerId. err = ' + err);
				});
				logger.info('queryProjectsByCustomerId performed ...');
				logger.info('data: ' + JSON.stringify(data, null, '\t'));

				res.json(data);
			});
			return res;
		} else {
			res.json([]);
			return res;
		}

	};
};
