module.exports = function(options) {
	var mysql = require("mysql");
	  return function queryGiorniCliente(req, res, next) {
		// First you need to create a connection to the db
	  var con = mysql.createConnection({
	    host: "localhost",
		user: "federico",
		database: "ehour"
	  });
	
	
	  var resList = {results: []};
	  con.query('select year(ENTRY_DATE) as anno, month(ENTRY_DATE) as mese, c.CUSTOMER_ID as idCliente, c.NAME as nomeCliente, round(sum(HOURS)/8,2) as giornateMese from TIMESHEET_ENTRY t join PROJECT_ASSIGNMENT a on t.ASSIGNMENT_ID = a.ASSIGNMENT_ID join PROJECT p on a.PROJECT_ID = p.PROJECT_ID join USERS u on u.USER_ID = a.USER_ID join CUSTOMER c on p.CUSTOMER_ID = c.CUSTOMER_ID group by anno, mese, c.CUSTOMER_ID having anno = year(now()) and mese = month(now()) - 1', function(err,rows){
			    if (err) throw err;

			    console.log('queryGiorniCliente performed ...');
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