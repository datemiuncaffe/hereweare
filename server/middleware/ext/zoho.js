module.exports = function(options) {
	var logger = require('./../../lib/logger');
	var request = require('request');

	return function zoho(req, res, next) {
		var url = "https://accounts.zoho.com/apiauthtoken/nb/create?";
		var params = {
			SCOPE: "ZohoProjects/projectsapi",
			EMAIL_ID: "federico.manganiello@senseisrl.it",
			PASSWORD: "10pietro"
		};

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
