module.exports = function(Project) {
  var moment = require('moment');

  function findLastId() {
    Project.find({ fields: {id: true} }, function(err, ids) {
      console.log('ids: ' + JSON.stringify(ids, null, '\t'));
      var idsArray = ids.map(function(o) {
        if (typeof o.id === 'number') {
          return o.id;
        }
      }).filter(function(id) {
        return id != null;
      });
      console.log('idsArray: ' + JSON.stringify(idsArray));
      var max = Math.max.apply(null, idsArray);
      console.log('max: ' + max);
    });
  }

  function toISODate(project) {
    var from = moment(project.from, "DD/MM/YYYY");
    var to = moment(project.to, "DD/MM/YYYY");
    project.from = from.toDate();
    project.to = to.toDate();
  }

  Project.createAndIncrementId = function(project, cb) {
    console.log('new project: ' + JSON.stringify(project, null, '\t'));

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
        console.log('projectseq name: ' + projectseq.name + '; no: ' + sequence);
        if (err) {
          cb(null, err);
        } else {
          project.id = sequence;
          console.log('insert Project with name: ' + JSON.stringify(project, null, '\t'));
          toISODate(project);
          console.log('insert Project with name: ' + JSON.stringify(project, null, '\t'));
          Project.upsert(project, function(err, createdProject) {
            console.log('createdProject: ' + JSON.stringify(createdProject, null, '\t'));
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
