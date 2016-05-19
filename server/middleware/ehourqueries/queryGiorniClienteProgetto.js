module.exports = function(options) {
	var mysql = require("mysql");
	  return function queryGiorniClienteProgetto(req, res, next) {
		// First you need to create a connection to the db
	  var con = mysql.createConnection({
	    host: "192.168.88.158",
		user: "centos",
		database: "ehour"
	  });
	
	
	  var resList = {results: []};
	  con.query('select c.NAME as nomeCliente, p.PROJECT_CODE as codiceProgetto, p.NAME as nomeProgetto, round(sum(HOURS)/8,2) as giornateMese from TIMESHEET_ENTRY t join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID join PROJECT p on a.PROJECT_ID = p.PROJECT_ID join USERS u on u.USER_ID = a.USER_ID join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID group by c.CUSTOMER_ID, p.PROJECT_ID order by c.CUSTOMER_ID, p.PROJECT_CODE', function(err,rows){
			    if (err) throw err;

			    console.log('queryGiorniClienteProgetto performed ...');
			    console.log(rows);
			    
			    var string = JSON.stringify(rows);
			    console.log('string: ' + string);
			    resList['results'] = JSON.parse(string);
			    console.log('resList: ' + JSON.stringify(resList));
			    res.json(resList);
			  }
			);
	  
	 
		  
	    return res;
	  }
};