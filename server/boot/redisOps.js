var MysqlPool = require('./../lib/mysql-pool').pool();
var bodyParser = require("body-parser");
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
  app.use(bodyParser.json());

  router.get('/server-info', function(req, res) {
    var serverInfo = redisClient.serverInfo;
    res.send(serverInfo);
  });

  router.get('/copy-users', function(req, res) {
    var report = {};
    var query = 'select USER_ID, FIRST_NAME,' +
                ' LAST_NAME, USERNAME, EMAIL,' +
                ' ACTIVE from USERS;';

    MysqlPool.getPool(getConnection);

		function getConnection() {
			MysqlPool.getConnection(getData, query);
		};

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

  router.post('/save-users', function(req, res) {
    var body = req.body;
    logger.info('body: ' +
      JSON.stringify(body, null, '\t'));
    var report = {};

    var ehourUsers = body.EHOUR_USERS;
    if (ehourUsers != null && ehourUsers.length > 0) {
      var userData = ehourUsers.map(function(item){
        var user = {};
        user['USER_ID'] = parseInt(item.userId);
        user['FIRST_NAME'] = item.firstName;
        user['LAST_NAME'] = item.lastName;
        user['USERNAME'] = item.userName;
        user['EMAIL'] = item.email;
        user['INTERNAL_COST'] = item.internalCost;
        return user;
      });

      save(userData, function(result){
        report.result = result;
        res.send(report);
      });
    } else {
      report.result = 'no users';
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

  /*------- internal functions ----------*/

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
        userHash.push('INTERNAL_COST');
        if (item.INTERNAL_COST != null &&
            item.INTERNAL_COST > 0) {
          userHash.push(item.INTERNAL_COST);
        } else {
          userHash.push(0);
        }

        multiClient.hmset(userHash);
      }
    });

    multiClient.zadd(usersSet);

    multiClient.exec(function (err, response) {
      if (err) {
        logger.info('err: ' +
          JSON.stringify(err, null, '\t'));
        result.code = 'KO';
        result.err = err;
        cb(result);
      } else {
        logger.info('response: ' +
          JSON.stringify(response, null, '\t'));
        result.code = 'OK';
        result.response = response;
        cb(result);
      }
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
          } else {
            result.code = 'OK';

            var multiClient = redisClient.multi();
            var values = [];
            response.forEach(function(item, index, array){
              if (index % 2 == 0) {
                var currentValue = {};
                currentValue['userId'] = array[index + 1];
                currentValue['firstName'] = '';
                currentValue['lastName'] = '';
                currentValue['userName'] = '';
                currentValue['email'] = '';
                currentValue['internalCost'] = '';
                currentValue['key'] = item;
                values.push(currentValue);

                multiClient.hgetall(item);
              }
            });

            multiClient.exec(function (err, response) {
              if (err) {
                logger.info('single err: ' +
                  JSON.stringify(err, null, '\t'));
                result.singlecode = 'KO SINGLE ELEMENTS';
                result.singleerr = err;
                cb(result);
              } else {
                logger.info('response: ' +
                  JSON.stringify(response, null, '\t'));
                result.singlecode = 'OK';
                result.singleresponse = response;
                if (response._repliesByKey != null) {
                  values.forEach(function(value) {
                    if (response._repliesByKey[value.key]) {
                      value['firstName'] =
                        response._repliesByKey[value.key]['FIRST_NAME'];
                      value['lastName'] =
                        response._repliesByKey[value.key]['LAST_NAME'];
                      value['userName'] =
                        response._repliesByKey[value.key]['USERNAME'];
                      value['email'] =
                        response._repliesByKey[value.key]['EMAIL'];
                      value['internalCost'] =
                        response._repliesByKey[value.key]['INTERNAL_COST'];
                    }
                  });
                }
                result[key] = values;
                cb(result);
              }
            });

            multiClient.discard();

          }
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
