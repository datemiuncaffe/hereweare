module.exports = function(options) {
	var logger = require('./../../lib/logger');
	var request = require('request');

	return function zohoGetPortals(req, res, next) {
		//var url = "https://accounts.zoho.com/apiauthtoken/create?";
		var url = "https://projectsapi.zoho.com/restapi/portals/";
		var params = {
			authtoken: "xxx",
			index: 1,
			range: 3
		};

		var queryparams = req.query;
		if (queryparams.authtoken != null &&
				queryparams.authtoken.length > 0) {
			params.authtoken = queryparams.authtoken;
		}

		request.get({
				url: url,
				qs: params
			}, function (err, resp, body) {
				//logger.info('response: ' + resp);
				logger.info('error: ' + err);
				var result = {
					response: resp,
					error: err
				};

				//logger.info(resp);
				if (!err && resp.statusCode == 200) {
			    logger.info(body); // Show the HTML for the Google homepage.
			  }
				res.json(result);
				//res.json({msg : 'ok'});
		});

		return res;
	};
};
