var MysqlPool = require('./../lib/mysql-pool').pool();
var logger = require('./../lib/logger');

var redis = require("redis");
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

  app.use('/redis-ops', router);

  function save(data, cb) {
    var result = {};

    //logger.info('data: ' +
    //  JSON.stringify(data, null, '\t'));
    var ehourUsers = ['ehourUsers'];
    data.forEach(function(item) {
      if (item.USER_ID != null && item.USER_ID > 0 &&
          item.USERNAME != null && item.USERNAME.length > 0) {
        ehourUsers.push(item.USER_ID);
        ehourUsers.push(item.USER_ID + '_' + item.USERNAME);
      }
    });

    logger.info('ehourUsers: ' +
      JSON.stringify(ehourUsers, null, '\t'));

    redisClient.zadd(ehourUsers, function (err, response) {
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
      result.response = response;
      cb(result);
    });

  }; // end save

  function read(key, datatype, cb) {
    var result = {};

    var arguments = null;
    switch (datatype) {
      case 'zset':
        arguments = [key, 0, -1];
        redisClient.zrange(arguments, function (err, response) {
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
