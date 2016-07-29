module.exports = function(options) {
  return function log(req, res, next) {
    var log = {
    	msg : 'message'
    };
    console.log('logging: ' + log);
    return res.json(log);
  }
};