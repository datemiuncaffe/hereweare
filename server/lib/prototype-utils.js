/** ---- usage ------------
	logger.info('prototype chain: ' +
	  tracePrototypeChainOf(ProjectInst));
	printPrototype(ProjectInst);

	insert into your code:
	require('./../lib/prototype-utils.js')
		.PrototypeUtils().tracePrototypeChainOf(Object);
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

var SimplePropertyRetriever = {
    getOwnEnumerables: function (obj) {
        return this._getPropertyNames(obj, true, false, this._enumerable);
         // Or could use for..in filtered with hasOwnProperty or just this: return Object.keys(obj);
    },
    getOwnNonenumerables: function (obj) {
        return this._getPropertyNames(obj, true, false, this._notEnumerable);
    },
    getOwnEnumerablesAndNonenumerables: function (obj) {
        return this._getPropertyNames(obj, true, false, this._enumerableAndNotEnumerable);
        // Or just use: return Object.getOwnPropertyNames(obj);
    },
    getPrototypeEnumerables: function (obj) {
        return this._getPropertyNames(obj, false, true, this._enumerable);
    },
    getPrototypeNonenumerables: function (obj) {
        return this._getPropertyNames(obj, false, true, this._notEnumerable);
    },
    getPrototypeEnumerablesAndNonenumerables: function (obj) {
        return this._getPropertyNames(obj, false, true, this._enumerableAndNotEnumerable);
    },
    getOwnAndPrototypeEnumerables: function (obj) {
        return this._getPropertyNames(obj, true, true, this._enumerable);
        // Or could use unfiltered for..in
    },
    getOwnAndPrototypeNonenumerables: function (obj) {
        return this._getPropertyNames(obj, true, true, this._notEnumerable);
    },
    getOwnAndPrototypeEnumerablesAndNonenumerables: function (obj) {
        return this._getPropertyNames(obj, true, true, this._enumerableAndNotEnumerable);
    },
    // Private static property checker callbacks
    _enumerable : function (obj, prop) {
        return obj.propertyIsEnumerable(prop);
    },
    _notEnumerable : function (obj, prop) {
        return !obj.propertyIsEnumerable(prop);
    },
    _enumerableAndNotEnumerable : function (obj, prop) {
        return true;
    },
    // Inspired by http://stackoverflow.com/a/8024294/271577
    _getPropertyNames : function getAllPropertyNames(obj, iterateSelfBool, iteratePrototypeBool, includePropCb) {
        var props = [];

        do {
            if (iterateSelfBool) {
                Object.getOwnPropertyNames(obj).forEach(function (prop) {
                    if (props.indexOf(prop) === -1 && includePropCb(obj, prop)) {
                        props.push(prop);
                    }
                });
            }
            if (!iteratePrototypeBool) {
                break;
            }
            iterateSelfBool = true;
        } while (obj = Object.getPrototypeOf(obj));

        return props;
    }
};

module.exports.PrototypeUtils = PrototypeUtils;
module.exports.PropertyRetriever = SimplePropertyRetriever;
