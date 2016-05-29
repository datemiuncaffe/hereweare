var mysql = require('mysql');
var async = require('async');
module.exports = function(options) {
	return function ehourmigratecosts(req, res, next) {
		console.log('ehour migrate hours into mongo db costs...');
				
		// data sources model
		var app = req.app;
		var Project = app.models.Project;

		var q = async.priorityQueue(migrate, 1);
		// assign a callback
		q.drain = function() {
			console.log('all projects have been processed');
		};
		
		var queryparams = req.query;
		var filter = {where:null};
		if (queryparams.customerId != null && queryparams.customerId > 0) {
			console.log(typeof queryparams.customerId);
			filter.where = {customerId : parseInt(queryparams.customerId)};
			console.log(JSON.stringify(filter));
		}
		
		Project.find(filter, function (err, projects) {
			console.log('err: ' + err);
			if (err) {
				console.log('err: ' + err);
			}
			console.log('projects: ' + projects);
			res.json(projects);
			
			// process projects
//			projects.forEach(function(project) {
//				console.log('project: ' + JSON.stringify(project));
//				q.push(project, null, function(err) {
//					console.log('end processing project = ' + project.name);
//				});
//			});			
			
		});

		
//		var mongoSequence = require('./../../lib/mongo-sequence');		
//		
		var con = mysql.createConnection({
			host : '192.168.88.158',
			user : 'centos',
			database : 'ehour'
		});
//		
//		// sequence
//		var connector = app.dataSources.mongoDs.connector;
//		var db = null;		
			
		
		function migrateCosts(project) {
			console.log('project: ' + project + '; code: ' + project.code);
			
			con.query('select year(ENTRY_DATE) as anno, month(ENTRY_DATE) as mese, c.NAME as nomeCliente, p.PROJECT_CODE as codiceProgetto, p.NAME as nomeProgetto, round(sum(HOURS)/8,2) as giornateMese from TIMESHEET_ENTRY t join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID join PROJECT p on a.PROJECT_ID = p.PROJECT_ID join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID group by anno, mese, c.CUSTOMER_ID, p.PROJECT_ID having codiceProgetto = \'' + project.code + '\' order by anno, mese;', function(err, costs) {
				if (err) {
					throw err;
				}
				
				var count = 0;
				async.whilst(
				    function () { return count < costs.length; },
				    function (callback) {
				    	console.log('cost: ' + JSON.stringify(costs[count]));
				    	count++;
				        setTimeout(function () {
				            callback(err, count);
				        }, 1000);
				    	
//				    	var projectseq = mongoSequence(db,'projects');
//						projectseq.getNext(function(err, sequence) {
//							console.log('projectseq name: ' + projectseq.name + '; no: ' + sequence);
//							if (err) {
//								count++;
//						        setTimeout(function () {
//						            callback(err, count);
//						        }, 1000);
//							} else {
//								console.log('insert Project with name: ' + projects[count].NAME);
//								Project.create({
//									id : sequence,
//									name : projects[count].NAME,
//									code : projects[count].PROJECT_CODE,
//									customerId : customerId
//								}, function(err, mongoproject) {
//									if (err) {
//										throw err;
//									}
//									console.log('Project created: \n', JSON.stringify(mongoproject));
//									count++;
//							        setTimeout(function () {
//							            callback(null, count);
//							        }, 1000);
//								});
//							}			
//						});			    	
				        
				    },
				    function (err, n) {
				        console.log('results: ' + n);
				    }
				);
			});			
		}
		
		function migrate(project, cb) {
			migrateCosts(project);
			cb();
		}

		return res;
	
	}  
};