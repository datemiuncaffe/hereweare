module.exports = function(Project) {
  var moment = require('moment');
  var logger = require('./../../server/lib/logger');

  function findLastId() {
    Project.find({ fields: {id: true} }, function(err, ids) {
      logger.info('ids: ' + JSON.stringify(ids, null, '\t'));
      var idsArray = ids.map(function(o) {
        if (typeof o.id === 'number') {
          return o.id;
        }
      }).filter(function(id) {
        return id != null;
      });
      logger.info('idsArray: ' + JSON.stringify(idsArray));
      var max = Math.max.apply(null, idsArray);
      logger.info('max: ' + max);
    });
  }

  function toISODate(project) {
    var from = moment(project.from, "DD/MM/YYYY");
    var to = moment(project.to, "DD/MM/YYYY");
    project.from = from.toDate();
    project.to = to.toDate();
  }

  Project.createAndIncrementId = function(project, cb) {
    logger.info('new project: ' + JSON.stringify(project, null, '\t'));

    var mongoSequence = require('./../../server/lib/mongo-sequence');
		var app = Project.app;
		// sequence
		var connector = app.dataSources.mongoBudgets.connector;
		var db = null;

		connector.connect(function(err, dbase){
			if (err) {
				throw err;
			}
			db = dbase;

			// create project
      var projectseq = mongoSequence(db,'projects');
      projectseq.getNext(function(err, sequence) {
        logger.info('projectseq name: ' + projectseq.name + '; no: ' + sequence);
        if (err) {
          cb(null, err);
        } else {
          project.id = sequence;
          logger.info('insert Project with name: ' + JSON.stringify(project, null, '\t'));
          toISODate(project);
          logger.info('insert Project with name: ' + JSON.stringify(project, null, '\t'));
          Project.upsert(project, function(err, createdProject) {
            logger.info('createdProject: ' + JSON.stringify(createdProject, null, '\t'));
            cb(null, createdProject);
          });
        }
      });

		});
  };

  Project.remoteMethod(
    'createAndIncrementId',
    {
      accepts:	[{arg: 'project', type: 'object'}],
      returns: {arg: 'createdProject', type: 'string'},
      http: {path: '/createAndIncrementId', verb: 'post'}
    }
  );

};
