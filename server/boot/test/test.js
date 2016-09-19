module.exports = function(app) {
	var logger = require('./../../lib/logger');

	logger.info('test on startup ...');
	const circle = require('./circle.js');
	logger.info( `The area of a circle of radius 4 is ${circle.area(4)}`);


	var mysqlpool = require('./../lib/mysql-pool');
	logger.info('mysqlpool: ' + JSON.stringify(mysqlpool.pool()));
	// logger.info('mysqlpool: ' + JSON.stringify(mysqlpool.MysqlPool));
	// var pool = mysqlpool();
	logger.info('mysqlpool keys: ' + Object.keys(mysqlpool.pool()));

};
