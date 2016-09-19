module.exports = function(options) {
	var logger = require('./../../lib/logger');

	return function clear(req, res, next) {
		logger.info('clear selected models... - options = ' + JSON.stringify(options));
		logger.info('req query params: ' + JSON.stringify(req.query));
		var app = req.app;

		// data sources
		var mongoDs = app.dataSources.mongoDs;

		// parse query string parameters
		var queryparams = req.query;
		if (queryparams.classname != null && queryparams.classname.length > 0) {
			var classtoclear = mongoDs.getModel(queryparams.classname);
			classtoclear.destroyAll({}, function(err, info) {
				if (err) {
					throw err;
				}
				var details = {
					classname: queryparams.classname,
					info: info
				};
				logger.info('destroy operation : ' + JSON.stringify(details));
				return res.json(details);
			});
		}

	};
};
