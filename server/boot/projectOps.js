var logger = require('./../lib/logger');
var bodyParser = require("body-parser");
var moment = require("moment");
var ProjectEmitter = require('./../lib/models/project.js').ProjectEmitter();

var ProjectModel = null;

var ProjectOps = function(app) {
  var router = app.loopback.Router();
  app.use(bodyParser.json());

  router.get('/count-projects', function(req, res) {
    var report = {};
    ProjectModel.count(null, function (err, count) {
      if (err) {
        if (err.message != null) {
          report.error = err.message;
        }
        res.send(report);
      } else {
        logger.info('there are %d projects', count);
        report.count = count;
        res.send(report);
      }
    });
  });

  router.get('/find-max-id-project', function(req, res) {
    var report = {};
    ProjectModel.find(null, null, null, function(err, docs) {
      logger.info('docs: ' +
        JSON.stringify(docs, null, '\t'));
      if (docs != null) {
        var idsArray = docs.map(function(o) {
          if (typeof o.id === 'number') {
            return o.id;
          }
        }).filter(function(id) {
          return id != null;
        });
        logger.info('idsArray: ' + JSON.stringify(idsArray));
        var max = Math.max.apply(null, idsArray);
        logger.info('max: ' + max);
        report.maxId = max;
        res.send(report);
      } else {
        report.msg = 'no projects';
        res.send(report);
      }
    });
  });

  router.get('/projects', function(req, res) {
    var report = {};
    ProjectModel.find(null, null, null, function(err, docs) {
      logger.info('docs: ' +
        JSON.stringify(docs, null, '\t'));
      if (docs != null) {
        report.projects = docs;
        res.send(report);
      } else {
        report.msg = 'no projects';
        res.send(report);
      }
    });
  });

  router.post('/save-project', function(req, res) {
    logger.info('post body: ' +
      JSON.stringify(req.body, null, '\t'));

    var report = {};
    if (req.body != null &&
        req.body.project != null) {
      report.inputProject = req.body.project;
      var Project = getProjectDoc(req.body.project);
      Project.save(function(err, response) {
        if (err) {
          if (err.message != null) {
            logger.info('err message: ' + err.message);
            report.error = err.message;
          }
          res.send(report);
        } else {
          logger.info('save project response: ' +
            JSON.stringify(response, null, '\t'));
          report.response = response;
          res.send(report);
        }
      });
    } else {
      report.response = 'no project in body request';
      res.send(report);
    }

  });

  app.use('/projects-ops', router);

  /*------- internal functions ----------*/
  function getProjectDoc(project) {
    var doc = {};
    if (project.id != null && project.id > 0) {
      doc.id = project.id;
    }
    if (project.from != null && project.from.length > 0) {
      doc.from = moment(project.from, "DD/MM/YYYY").toDate();
    }
    if (project.to != null && project.to.length > 0) {
      doc.to = moment(project.to, "DD/MM/YYYY").toDate();
    }
    if (project.name != null && project.name.length > 0) {
      doc.name = project.name;
    }
    if (project.code != null && project.code.length > 0) {
      doc.code = project.code;
    }
    if (project.daystot != null && project.daystot > 0) {
      doc.daystot = project.daystot;
    }
    if (project.budgettot != null && project.budgettot > 0) {
      doc.budgettot = project.budgettot;
    }
    if (project.customerId != null && project.customerId > 0) {
      doc.customerId = project.customerId;
    }

    var Project = new ProjectModel(doc);
    return Project;

  }; // end getProjectDoc
};

module.exports = ProjectOps;

ProjectEmitter.on('once', (emitter) => {
  logger.info('once event occurred!');
  ProjectModel = emitter.obj;
});
