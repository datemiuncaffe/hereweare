var logger = require('./../logger');
var MultiPromise = require("mongoose").Promise;

MultiPromise.all = function(promises) {
  var mainPromise = new MultiPromise();
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

module.exports.MultiPromise = MultiPromise;
