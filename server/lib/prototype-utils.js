/** ---- usage ------------
	logger.info('prototype chain: ' +
	  tracePrototypeChainOf(ProjectInst));
	printPrototype(ProjectInst);
**/

var PrototypeUtils = function() {
	var logger = require('./logger');

	var res = {
		tracePrototypeChainOf: function(object) {
	    var proto = object.constructor.prototype,
	        result = '';
	    while (proto) {
	      result += ' -> ' + proto.constructor.name;
	      proto = Object.getPrototypeOf(proto)
	    }
	    return result;
	  },
	  printPrototype: function(obj, i) {
	    var n = Number(i || 0);
	    var indent = Array(2 + n).join("-");

	    for(var key in obj) {
	        if(obj.hasOwnProperty(key)) {
	            //console.log(indent, key, ": ", obj[key]);
	            console.log(indent, obj.constructor.name, key, ": ");
	        }
	    }

	    if(obj) {
	        if(Object.getPrototypeOf) {
	            printPrototype(Object.getPrototypeOf(obj), n + 1);
	        } else if(obj.__proto__) {
	            printPrototype(obj.__proto__, n + 1);
	        }
	    }
	  }
	};

	return res;
};

module.exports.PrototypeUtils = PrototypeUtils;
