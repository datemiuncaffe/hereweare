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

  router.get('/checkRedisConn', function(req, res) {
    var serverInfo = redisClient.serverInfo;
    res.send(serverInfo);
  });

  router.get('/copyUsers', function(req, res) {
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
        logger.info('users: ' +
          JSON.stringify(users, null, '\t'));
        report.users = users;

        res.send(report);
			});
		};

  });

  app.use('/redisSync', router);

};
