var MysqlPool = function() {
	var logger = require('./logger');
	var mysql = require('mysql');

	var pool  = null;
	var res = {
		queueLimit: 8,
		connectionLimit : 4,
		checklog: function() {
			logger.info('simple check');
		},
		getPool: function(cb) {
			if (pool) {
				logger.info('pool: ' + pool);
				cb();
			} else {
				pool = mysql.createPool({
					queueLimit: 8,
				  	connectionLimit : 4,
					host : "192.168.88.55",
					user : "ehour",
					password: "ehour",
					database : "ehour"
				});
				logger.info('create pool: ' + pool);
				cb();
			}
		},
		getConnection: function(cb, options) {
			logger.info('pool: ' + pool);
			pool.getConnection(function(err, connection) {
				if (err) {
					logger.info('err: ' + err);
					cb(err, null, options);
				}
				logger.info('acquired connection');
				cb(err, connection, options);
			});
		},
		releaseConnection: function(connection) {
			connection.release();
		}
	};
	return res;
};

module.exports.pool = MysqlPool;
