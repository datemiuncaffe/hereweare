var MysqlPool = require('./../lib/mysql-pool').pool();
var logger = require('./../lib/logger');

var redis = require("redis");
require('node-redis-multi')(redis);
//require('../lib/multi')(redis);
var redisClientOpts = {
  host: '127.0.0.1',
  port: 6379
};
var redisClient = redis.createClient(redisClientOpts);

var datatypes = ['list', 'set', 'zset'];

module.exports = function(app) {
  var router = app.loopback.Router();

  router.get('/server-info', function(req, res) {
    var serverInfo = redisClient.serverInfo;
    res.send(serverInfo);
  });

  router.get('/copy-users', function(req, res) {
    var report = {};
    var query = 'select USER_ID, FIRST_NAME,' +
                ' LAST_NAME, USERNAME, EMAIL,' +
                ' ACTIVE from USERS;';

    MysqlPool.getConnection(getData, query);

    function getData(err, connection, query) {
			connection.query(query, function(err, users) {
				if (err) {
					logger.info('err: ' + JSON.stringify(err));
					MysqlPool.releaseConnection(connection);
					throw err;
				}
				MysqlPool.releaseConnection(connection);
        //logger.info('users: ' +
        //  JSON.stringify(users, null, '\t'));

        if (users != null && users.length > 0) {
          save(users, function(result){
            report.result = result;
            res.send(report);
          });
        } else {
          report.result = 'no users to save';
          res.send(report);
        }

			});
		};

  });

  router.get('/users', function(req, res) {
    var report = {};

    var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams));
    var key = queryparams.key;
    var datatype = queryparams.datatype;

    if (key != null && key.length > 0 &&
        datatypes.indexOf(datatype) > -1) {
      read(key, datatype, function(result){
        report.result = result;
        res.send(report);
      });
    } else {
      report.result = 'specify key and datatype parameters';
      res.send(report);
    }

  });

  router.all('/del-users', function(req, res) {
    var report = {};

    var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams));
    var key = queryparams.key;
    var datatype = queryparams.datatype;

    if (key != null && key.length > 0 &&
        datatypes.indexOf(datatype) > -1) {
      del(key, datatype, function(result){
        report.result = result;
        res.send(report);
      });
    } else {
      report.result = 'specify key and datatype parameters';
      res.send(report);
    }

  });

  router.all('/del-all', function(req, res) {
    var report = {};

    redisClient.flushdb(function (err, response) {
      if (err) {
        report.code = 'KO';
        report.err = err;
        res.send(report);
      } else {
        report.code = 'OK';
        report.msg = 'db flushed';
        res.send(report);
      }
    });

  });

  app.use('/redis-ops', router);

  function save(data, cb) {
    var result = {};
    var multiClient = redisClient.multi();

    var usersSet = ['EHOUR_USERS'];
    data.forEach(function(item) {
      if (item.USER_ID != null && item.USER_ID > 0) {
        var userHashKey = 'EHOUR_USER_' + item.USER_ID;
        usersSet.push(item.USER_ID);
        usersSet.push(userHashKey);

        var userHash = [userHashKey];
        userHash.push('FIRST_NAME');
        userHash.push(item.FIRST_NAME);
        userHash.push('LAST_NAME');
        userHash.push(item.LAST_NAME);
        userHash.push('USERNAME');
        userHash.push(item.USERNAME);
        userHash.push('EMAIL');
        userHash.push(item.EMAIL);
        userHash.push('COSTO_INTERNO');
        userHash.push(0);

        //logger.info('userHash: ' +
        //  JSON.stringify(userHash, null, '\t'));

        //multiClient.set(userHashKey, 0);

        logger.info('multiClient: ' + multiClient);
      }
    });

    var userHashEx = ['EHOUR_USER_EX'];
    userHashEx.push('FIRST_NAME');
    userHashEx.push('FEDERICO');
    userHashEx.push('COSTO_INTERNO');
    userHashEx.push(0);
    //multiClient.set('EHOUR_USER_EX', 0);
    multiClient.hmset(userHashEx);

    multiClient.zadd(usersSet);

    logger.info('multiClient keys: ' +
      JSON.stringify(Object.keys(multiClient), null, '\t'));

    multiClient.exec(function (err, response) {
      logger.info('err: ' +
        JSON.stringify(err, null, '\t'));
      logger.info('response: ' +
        JSON.stringify(response, null, '\t'));
      if (err) {
        result.code = 'KO';
        result.err = err;
        cb(result);
      }
      result.code = 'OK';
      logger.info('saved data: ' +
        JSON.stringify(response, null, '\t'));
      result.response = response;
      cb(result);
    });

    multiClient.discard();

  }; // end save

  function read(key, datatype, cb) {
    var result = {};

    var arguments = null;
    switch (datatype) {
      case 'zset':
        arguments = [key, 0, -1, 'WITHSCORES'];
        redisClient.zrange(arguments, function (err, response) {
          if (err) {
            result.code = 'KO';
            result.err = err;
            cb(result);
          }
          result.code = 'OK';

          var values = [];
          response.forEach(function(item, index, array){
            if (index % 2 == 0) {
              var currentValue = {};
              currentValue['userId'] = array[index + 1];
              currentValue['firstName'] = '';
              currentValue['lastName'] = '';
              currentValue['userName'] = item;
              currentValue['email'] = '';
              currentValue['internalCost'] = '';
              values.push(currentValue);
            }
          });

          result[key] = values;
          cb(result);
        });
        break;

      default:

    }

  }; // end read

  function del(key, datatype, cb) {
    var result = {};

    var arguments = null;
    switch (datatype) {
      case 'zset':
        arguments = [key, 0, -1];
        redisClient.zremrangebyrank(arguments, function (err, response) {
          if (err) {
            result.code = 'KO';
            result.err = err;
            cb(result);
          }
          result.code = 'OK';
          result.response = response;
          cb(result);
        });
        break;

      default:

    }

  }; // end del

};
