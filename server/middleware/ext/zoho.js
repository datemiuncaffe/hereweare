module.exports = function(options) {
	var logger = require('./../../lib/logger');
	var request = require('request');

	return function zoho(req, res, next) {
		var params = "SCOPE=ZohoProjects/projectsapi";
		//--post-data="lid=federico.manganiello@senseisrl.it&pwd=10pietro"
		var url = "https://accounts.zoho.com/apiauthtoken/create?";
		url += params;

		var formData = {
			lid: "federico.manganiello@senseisrl.it",
			pwd: "10pietro"
		};

		request.post({
				url: url,
				formData: formData
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
