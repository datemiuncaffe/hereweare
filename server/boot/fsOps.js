var fs = require('fs');
var path = require('path');
var bodyParser = require("body-parser");
var logger = require('./../lib/logger');

module.exports = function(app) {
  var router = app.loopback.Router();
  logger.info("dirname: " + __dirname);
  logger.info("filename: " + __filename);
  var bootfile = path.parse(__filename);
  var conf = {};
  conf.bootfile = bootfile;
  conf.sep = path.sep;
  conf.serverdir =
    bootfile.dir.substring(0, bootfile.dir.lastIndexOf(conf.sep));

  app.use(bodyParser.json());

  router.get('/read', function(req, res) {
    var result = {};

    var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams));
    var fileName = queryparams.filename;
    if (fileName != null && fileName.length > 0) {
      var filePath = path.resolve(conf.serverdir, 'documents', fileName);
      result.filePath = filePath;
      fs.readFile(filePath, 'utf8', (err, data) => {
        logger.info('data: ' + JSON.stringify(data));
        if (err) {
          result.err = err;
          throw err;
        }
        result.json = JSON.parse(data);
        res.send(result);
      });
    } else {
      res.send(result);
    }

  });

  router.post('/save', function(req, res) {
    logger.info('save');
    var body = req.body;
    logger.info('body: ' +
      JSON.stringify(body, null, '\t'));
    var result = {};

    var fileName = body.fileName;
    var fileContent = body.fileContent;
    if (fileName != null && fileName.length > 0 &&
        fileContent != null && fileContent.length > 0) {
      var filePath = path.resolve(conf.serverdir, 'documents', fileName);
      result.filePath = filePath;
      fs.writeFile(filePath, fileContent, (err) => {
        logger.info('saving data');
        if (err) {
          result.msg = 'writing error';
          result.err = err;
          res.send(result);
        }
        result.msg = 'writing ok';
        result.err = 'no err';
        logger.info('result: ' +
          JSON.stringify(result, null, '\t'));
        res.send(result);
      });
    } else {
      result.msg = 'no data to write';
      res.send(result);
    }

  });

  router.get('/browseDocs', function(req, res) {
    var result = {};

    result.docDir = path.resolve(conf.serverdir, 'documents');
    result.docContent = fs.readdirSync(result.docDir);
    result.numOfDocs =
      result.docContent != null ? result.docContent.length : 0;

    res.send(result);
  });

  router.get('/processInfo', function(req, res) {
    logger.info("cwd: " + process.cwd());
    logger.info(`Current directory: ${process.cwd()}`);
    logger.info("env: " + JSON.stringify(process.env, null, '\t'));
    logger.info("execPath: " + process.execPath);
    logger.info("gid: " + process.getgid());
    logger.info("uid: " + process.getuid());

    var processInfo = {
      cwd: process.cwd(),
      env: JSON.stringify(process.env, null, '\t'),
      execPath: process.execPath,
      gid: process.getgid(),
      uid: process.getuid()
    };

    res.send(processInfo);
  });

  app.use(router);
};
