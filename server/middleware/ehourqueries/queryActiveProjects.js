module.exports = function(options) {
	var mysql = require("mysql");
	var logger = require('./../../lib/logger');
	
	return function queryActiveProjects(req, res, next) {
		// First you need to create a connection to the db
		var con = mysql.createConnection({
			host : "192.168.88.158",
			user : "centos",
			database : "ehour"
		});

		con.query('select c.CUSTOMER_ID as customerId, c.NAME as customerName, c.CODE as customerCode, c.ACTIVE as customerActive, p.PROJECT_ID as projectId, p.NAME as projectName, p.PROJECT_CODE as projectCode, p.ACTIVE as projectActive FROM PROJECT p join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID WHERE p.ACTIVE = \'y\';', function(err, data) {
			var results = {customers: []};
			if (err) {
				logger.info('err: ' + JSON.stringify(err));
				results.error = JSON.stringify(err);
				con.end(function(err) {
					logger.info('ending connection queryActiveProjects not performed. err = ' + err);
				});
				res.json(results);
			}

			con.end(function(err) {
				logger.info('ending connection after queryActiveProjects. err = ' + err);
			});
			logger.info('queryActiveProjects performed ...');
			logger.info('data: ' + JSON.stringify(data, null, '\t'));
			if (data != null && data.length > 0) {
				results.customers = data;
			}

			res.json(results);
		});
		return res;
	};
};
