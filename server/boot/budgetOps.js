var logger = require('./../lib/logger');
var moment = require("moment");
var bodyParser = require("body-parser");
var BudgetEmitter = require('./../lib/models/budget.js').BudgetEmitter();
var MultiPromise = require('./../lib/models/promises.js').MultiPromise;

var BudgetModel = null;

var BudgetOps = function(app) {
  var router = app.loopback.Router();
  app.use(bodyParser.json());

  router.get('/budgets', function(req, res) {
    var report = {};
    var queryparams = req.query;
		logger.info('queryparams: ' + JSON.stringify(queryparams));
    var projectId = queryparams.id;
    if (projectId != null && projectId > 0) {
      logger.info('projectId: ' + projectId);
      var conditions = {
        projectId: projectId
      };
      BudgetModel.find(conditions, null, null, function(err, docs) {
        logger.info('budgets docs: ' + JSON.stringify(docs, null, '\t'));
        if (docs != null) {
          report.budgets = docs;
          res.send(report);
        } else {
          report.msg = 'no budgets for projectId: ' + projectId;
          res.send(report);
        }
      });
    } else {
      report.msg = 'no projectId';
      res.send(report);
    }
  });

  router.put('/update-all-by-project-id', function(req, res) {
    logger.info('post body: ' +
      JSON.stringify(req.body, null, '\t'));

    var report = {};
    if (req.body != null &&
        req.body.projectId != null &&
        req.body.budgets != null) {
      updateAllByProjectId(req.body.projectId, req.body.budgets, function (err, response) {
        if (err) {
          if (err.message != null) {
            report.error = err.message;
          }
          res.send(report);
        } else {
          logger.info('update successfull: ', response);
          report.response = response;
          res.send(report);
        }
      });
    } else {
      report.response = 'no budgets in body request';
      res.send(report);
    }

  });

  app.use('/budgets-ops', router);

  /*------- internal functions ----------*/
  function toISODate(budget) {
    var from = moment(budget.from, "DD/MM/YYYY");
    var to = moment(budget.to, "DD/MM/YYYY");
    budget.from = from.toDate();
    budget.to = to.toDate();
  };

  function updateAllByProjectId(project_id, newBudgets, cb) {
    var budgetsToSave = newBudgets.filter(function(budget){
      return (budget.status === 'save');
    });
    var budgetsToUpdate = newBudgets.filter(function(budget){
      return (budget.status === 'update');
    });
    var budgetsToDelete = newBudgets.filter(function(budget){
      return (budget.status !== 'save' && budget.status !== 'update');
    });
    logger.info('budgetsToSave: ' + JSON.stringify(budgetsToSave, null, '\t'));
    logger.info('budgetsToUpdate: ' + JSON.stringify(budgetsToUpdate, null, '\t'));
    logger.info('budgetsToDelete: ' + JSON.stringify(budgetsToDelete, null, '\t'));

    var tasks = [];
    if (budgetsToSave != null && budgetsToSave.length > 0) {
      budgetsToSave.forEach(function(budget){
        var Budget = getBudgetDoc(budget);
        tasks.push(Budget.save());
      });
    }
    if (budgetsToUpdate != null && budgetsToUpdate.length > 0) {
      budgetsToUpdate.forEach(function(budget){
        var Budget = getBudgetDoc(budget);
        tasks.push(Budget.remove());
        tasks.push(Budget.save());
        //task.push(BudgetModel.findByIdAndUpdate(id, obj, null, cbk));
      });
    }
    if (budgetsToDelete != null && budgetsToDelete.length > 0) {
      budgetsToDelete.forEach(function(budget){
        var Budget = getBudgetDoc(budget);
        tasks.push(Budget.remove());
        //task.push(BudgetModel.findByIdAndRemove(id, null, cbk));
      });
    }

    if (tasks.length > 0) {
      // var promise = new MultiPromise.ES6();
      MultiPromise.all(tasks);
      // MultiPromise.all(tasks).then(function(results) {
      //   console.log(results);
      // }, function (err) {
      //   console.log(err);
      // });
    } else {

    }
    cb(null, {});
  };

  function getBudgetDoc(budget) {
    var doc = {};
    if (budget.from != null && budget.from.length > 0) {
      doc.from = moment(budget.from, "DD/MM/YYYY").toDate();
    }
    if (budget.to != null && budget.to.length > 0) {
      doc.to = moment(budget.to, "DD/MM/YYYY").toDate();
    }
    if (budget.year != null && budget.year > 0) {
      doc.year = budget.year;
    }
    if (budget.month != null && budget.month.length > 0) {
      doc.month = budget.month;
    }
    if (budget.days != null && budget.days > 0) {
      doc.days = budget.days;
    }
    if (budget.businessdays != null && budget.businessdays.length > 0) {
      doc.businessdays = budget.businessdays;
    }
    if (budget.amount != null && budget.amount > 0) {
      doc.amount = budget.amount;
    }
    if (budget.projectId != null && budget.projectId > 0) {
      doc.projectId = budget.projectId;
    }

    var Budget = new BudgetModel(doc);
    return Budget;

  }; // end getBudgetDoc

};

module.exports = BudgetOps;

BudgetEmitter.on('once', (emitter) => {
  logger.info('once event occurred!');
  BudgetModel = emitter.obj;
});
