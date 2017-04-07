module.exports = function(options) {
	var mm = require('mongodb-migrations');
	var MysqlPool = require('./../../lib/mysql-pool').pool();
	var logger = require('./../../lib/logger');

	var cwd = process.cwd();
	var mongoDbConfig = {
		host: 'localhost',
		db: 'migrations',
		port: 27017
	};

	return function mysqlToMongodb(req, res, next) {
		logger.info('starting mysqlToMongodb ...');
		logger.info('req: ' + req);

		var migrator = new mm.Migrator(mongoDbConfig, null);

		// migrator._loadMigrationFiles('migrations', function(err) {
		// 	logger.info('err: ' + err);
		// });

		migrator.create(cwd + '/setup/migrations', 0, function(err, result) {
			logger.info('err: ' + err);
			logger.info('result: ' + result);
		});

		// var queries = {
		// 	ALL: 'SELECT c.NAME as name, c.CODE as code, c.CUSTOMER_ID as id FROM CUSTOMER c ORDER BY name;',
		// 	INT: 'SELECT c.NAME as name, c.CODE as code, c.CUSTOMER_ID as id FROM CUSTOMER c WHERE code IN (\'ASS\',\'SEN\') ORDER BY name;',
		// 	EXT: 'SELECT c.NAME as name, c.CODE as code, c.CUSTOMER_ID as id FROM CUSTOMER c WHERE code NOT IN (\'ASS\',\'SEN\') ORDER BY name;',
		// 	NOTACTIVE: '',
		// 	ACTIVE: 'select DISTINCT c.CUSTOMER_ID as id, c.NAME as name FROM PROJECT p join PROJECT_ASSIGNMENT a on p.PROJECT_ID = a.PROJECT_ID join TIMESHEET_ENTRY t on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID WHERE t.ENTRY_DATE IS NOT NULL AND t.ENTRY_DATE > \'' + lowdatelimit + '\' AND p.CUSTOMER_ID NOT IN (4,8) ORDER BY name;',
		// 	NEW: 'select DISTINCT c.CUSTOMER_ID as id, c.NAME as name FROM PROJECT p join PROJECT_ASSIGNMENT a on p.PROJECT_ID = a.PROJECT_ID join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID WHERE a.DATE_START IS NOT NULL AND a.DATE_START > \'' + lowdatelimit + '\' AND p.CUSTOMER_ID NOT IN (4,8) ORDER BY name;'
		// };
		//
		// // parse query string parameters
		// var queryparams = req.query;
		// logger.info('queryparams: ' + JSON.stringify(queryparams));
		//
		// var query = queries.ALL;
		// if (queryparams.customerGroup != null) {
		// 	if (queryparams.customerGroup == 'INT') {
		// 		query = queries.INT;
		// 	} else if (queryparams.customerGroup == 'EXT') {
		// 		query = queries.EXT;
		// 	} else if (queryparams.customerGroup == 'ACTIVE') {
		// 		query = queries.ACTIVE;
		// 	} else if (queryparams.customerGroup == 'NOTACTIVE') {
		// 		query = queries.NOTACTIVE;
		// 	} else if (queryparams.customerGroup == 'NEW') {
		// 		query = queries.NEW;
		// 	}
		// }
		//
		// MysqlPool.getPool(getConnection);
		//
		// function getConnection() {
		// 	MysqlPool.getConnection(getData, query);
		// };
		//
		// function getData(err, connection, query) {
		// 	connection.query(query, function(err, customers) {
		// 		if (err) {
		// 			// con.end(function(err) {
		// 			// 	logger.info('ending connection queryCustomers not performed. err = ' + err);
		// 			// });
		// 			logger.info('err: ' + JSON.stringify(err));
		// 			MysqlPool.releaseConnection(connection);
		// 			throw err;
		// 		}
		//
		// 		// con.end(function(err) {
		// 		// 	logger.info('ending connection after queryCustomers. err = ' + err);
		// 		// });
		// 		MysqlPool.releaseConnection(connection);
		//
		// 		logger.info('queryCustomers performed ...');
		// 		logger.info('customers: ' + JSON.stringify(customers, null, '\t'));
		//
		// 		res.json(customers);
		// 	});
		// };

		return res.json([]);

	};
};
