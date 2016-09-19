module.exports = function(options) {
  var logger = require('./../lib/logger');

  return function log(req, res, next) {
    var log = {
    	msg : 'message'
    };
    logger.info('logging: ' + log);
    return res.json(log);
  }
};
