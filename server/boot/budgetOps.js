var logger = require('./../lib/logger');
var Budget = require('./../lib/models/budget.js').Budget();
logger.info('budget: ' + Budget);

var BudgetObj = null;

var BudgetOps = function(app) {
  var router = app.loopback.Router();
  logger.info('int budget: ' +
    JSON.stringify(Budget, null, '\t'));

  router.get('/numBudgets', function(req, res) {
    var report = {};

    var queryparams = req.query;
    logger.info('queryparams: ' + JSON.stringify(queryparams));
    var conditions = null;
    if (queryparams.conditions != null) {
      conditions = queryparams.conditions;
    }

    BudgetObj.count(conditions, function(err, response) {
      if (err) {
        report.error = err;
        report.response = response;
        res.send(report);
      }
      logger.info('there are %d budgets', response.count);
      report.response = response;
      res.send(report);
    });

  });

  router.get('/budgets', function(req, res) {
    var report = {};

    var queryparams = req.query;
    logger.info('queryparams: ' +
      JSON.stringify(queryparams));

    var conditions = {};
    if (queryparams._id != null &&
        queryparams._id > 0) {
      conditions._id = parseInt(queryparams._id);
    }
    logger.info('conditions: ' +
      JSON.stringify(conditions));

    BudgetObj.findOne(conditions, function(err, response) {
      if (err) {
        report.error = err;
        report.response = response;
        res.send(report);
      }
      logger.info('find one budget', response.budget);
      report.response = response;
      res.send(report);
    });

  });

  app.use('/budget-ops', router);

  /*------- internal functions ----------*/

};

module.exports = BudgetOps;

Budget.on('once', (Budg) => {
  logger.info('once event occurred!');
  logger.info('Budg: ' +
    JSON.stringify(Object.keys(Budg), null, '\t'));
  BudgetObj = Budg;
});
