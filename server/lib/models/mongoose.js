var Mongoose = function() {
	var logger = require('./../logger');
	var mongoose = require('mongoose');
	var autoIncrement = require('mongoose-sequence');
	var url = "mongodb://localhost:$mongodbport$/senseibudgets";
	mongoose.connect(url);

	var res = {
		obj: mongoose,
		autoIncrement: autoIncrement,
		getSchema: function() {
			return mongoose.Schema;
		},
		getConnection: function() {
			return mongoose.connection;
		}
	};

	return res;
};

module.exports.mongoose = Mongoose;
