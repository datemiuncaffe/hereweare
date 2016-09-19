var MysqlPool = function() {
	var logger = require('./logger');
	var mysql = require('mysql');
	var pool  = mysql.createPool({
	  connectionLimit : 30,
		host : "192.168.88.158",
		user : "centos",
		database : "ehour"
	});

	var res = {
		connectionLimit : 10,
		checklog: function() {
			logger.info('simple check');
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
