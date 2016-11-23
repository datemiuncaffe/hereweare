var MysqlPool = require('./../lib/mysql-pool').pool();
var logger = require('./../lib/logger');

var redis = require("redis");
var redisClientOpts = {
  host: '127.0.0.1',
  port: 6379
};
var redisClient = redis.createClient(redisClientOpts);

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

  function read() {
    // -Infinity and +Infinity also work
    var args1 = [ 'myzset', '+inf', '-inf' ];
    client.zrevrangebyscore(args1, function (err, response) {
        if (err) throw err;
        console.log('example1', response);
        // write your code here
    });

    var max = 3, min = 1, offset = 1, count = 2;
    var args2 = [ 'myzset', max, min, 'WITHSCORES', 'LIMIT', offset, count ];
    client.zrevrangebyscore(args2, function (err, response) {
        if (err) throw err;
        console.log('example2', response);
        // write your code here
    });
  };

};
