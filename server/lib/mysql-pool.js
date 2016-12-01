var MysqlPool = function() {
	var logger = require('./logger');
	var mysql = require('mysql');

	var pool  = null;
	var res = {
		connectionLimit : 10,
		checklog: function() {
			logger.info('simple check');
		},
		getPool: function(cb) {
			if (pool) {
				logger.info('pool: ' + pool);
				cb();
			} else {
				pool = mysql.createPool({
				  connectionLimit : 10,
					host : "192.168.88.158",
					user : "centos",
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
					throw err;
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
