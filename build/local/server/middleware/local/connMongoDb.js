module.exports = function(options) {
	//lets require/import the mongodb native drivers.
	var mongodb = require('mongodb');
	return function connMongoDb(req, res, next) {
		//We need to work with "MongoClient" interface in order to connect to a mongodb server.
		var MongoClient = mongodb.MongoClient;

		// Connection URL. This is where your mongodb server is running.
		var url = 'mongodb://localhost:27017/test2';

		// Use connect method to connect to the Server
		MongoClient.connect(url, function (err, db) {
		  if (err) {
		    console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
		    //HURRAY!! We are connected. :)
		    console.log('Connection established to', url);

		    // do some work here with the database.
//		    console.log('queryGiorni performed ...');
//		    console.log(rows);
//
//		    var string = JSON.stringify(rows);
//		    console.log('string: ' + string);
//		    resList['results'] = JSON.parse(string);
//		    console.log('resList: ' + JSON.stringify(resList));
//		    res.json(resList);

		    // Get the documents collection
		    var collection = db.collection('users');

		    //Create some users
		    var user1 = {name: 'modulus admin', age: 42, roles: ['admin', 'moderator', 'user']};
		    var user2 = {name: 'modulus user', age: 22, roles: ['user']};
		    var user3 = {name: 'modulus super admin', age: 92, roles: ['super-admin', 'admin', 'moderator', 'user']};

		    // Insert some users
		    collection.insert([user1, user2, user3], function (err, result) {
		      if (err) {
		        console.log(err);
		      } else {
		        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
		      }
		      //Close connection
		      db.close();
		      console.log('connection closed');
		    });
		    res.json({msg : 'ok'});
		  }
		});

		return res;
	};
};
