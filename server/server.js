var loopback = require('loopback');
var boot = require('loopback-boot');
var logger = require('./lib/logger');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    logger.info('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      logger.info('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

var bootDirs = [
   __dirname + '/boot/test',
   __dirname + '/boot/models',
   __dirname + '/boot/disabled'
];
var bootOptions = {
   appRootDir: __dirname,
   bootDirs: bootDirs
};
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, bootOptions, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
