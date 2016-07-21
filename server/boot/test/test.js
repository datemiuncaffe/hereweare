module.exports = function(app) {
	console.log('test on startup ...');
	const circle = require('./circle.js');
	console.log( `The area of a circle of radius 4 is ${circle.area(4)}`);


	var mysqlpool = require('./../lib/mysql-pool');
	console.log('mysqlpool: ' + JSON.stringify(mysqlpool.pool()));
	// console.log('mysqlpool: ' + JSON.stringify(mysqlpool.MysqlPool));
	// var pool = mysqlpool();
	console.log('mysqlpool keys: ' + Object.keys(mysqlpool.pool()));

};
