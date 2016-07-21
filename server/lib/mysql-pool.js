var MysqlPool = function() {
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
			console.log('simple check');
		},
		getConnection: function(cb, query) {
			console.log('pool: ' + pool);
			pool.getConnection(function(err, connection) {
				if (err) {
					console.log('err: ' + err);
					throw err;
				}
				console.log('acquired connection');
				cb(connection, query);
			});
		},
		releaseConnection: function(connection) {
			connection.release();
		}
	};
	return res;
};

module.exports.pool = MysqlPool;
