var MongoPool = function() {
	var logger = require('./logger');
	var MongoClient = require('mongodb').MongoClient;
	var url = "mongodb://localhost:$mongodbport$/senseibudgets";
	var mongoParams  = {
	  poolSize: 10
	};

	var res = {
		checklog: function() {
			logger.info('simple check');
		},
		getConnection: function(cb, options) {
			MongoClient.connect(url, mongoParams, function(err, db) {
				if (err) {
					logger.info('mongo db connection failed. err: ' + err);
					throw err;
				}
				logger.info('acquired connection');
				cb(err, db, options);
			});
		},
		releaseConnection: function(db) {
			db.close();
		}
	};
	return res;
};

module.exports.pool = MongoPool;
