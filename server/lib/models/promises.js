var logger = require('./../logger');
//var MultiPromise = require("mongoose").Promise;
var Promise = require("mongoose").Promise;
logger.info('Promise: ' + Promise);

Promise.all = function(promises) {
  var mainPromise = new Promise();
  if (promises.length == 0) {
    mainPromise.resolve(null, promises);
  }

  var pending = 0;
  promises.forEach(function(p, i) {
    pending++;
		logger.info('pending: ' + pending);
    p.then(function(val) {
      promises[i] = val;
			logger.info('inner val: ' + val);
			logger.info('inner pending: ' + pending);
      if (--pending === 0) {
        mainPromise.resolve(null, promises);
      }
    }, function(err) {
      mainPromise.reject(err);
    });
  });

  return mainPromise;
};

module.exports.MultiPromise = Promise;
