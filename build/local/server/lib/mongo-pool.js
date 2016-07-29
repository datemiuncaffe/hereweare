var MongoPool = function() {
	var MongoClient = require('mongodb').MongoClient;
	var url = "mongodb://localhost:27017/senseibudgets";
	var mongoParams  = {
	  poolSize: 10
	};

	var res = {
		checklog: function() {
			console.log('simple check');
		},
		getConnection: function(cb, options) {
			MongoClient.connect(url, mongoParams, function(err, db) {
				if (err) {
					console.log('mongo db connection failed. err: ' + err);
					throw err;
				}
				console.log('acquired connection');
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
