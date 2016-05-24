var MongoSequence = function(db,name,opts) {
	var seq = {
		db : db,
		name : name,
		opts : opts,
		getNext : function(cb) {
			console.log('updating sequence...');
			
			collection.findAndModify(
				{ _id: name },
				[],
				{ $inc: { sequence: 1 } },      
				{upsert : true,	new: true}, 
				function(err, obj) {
					console.log('err: ' + err + '; obj sequence: '+ obj.sequence + '; obj: ' + JSON.stringify(obj));
					if (err) {
						cb(err)
					}
					else {
						cb(null, obj.value.sequence)
					} 
				}
			);			
		}
	};
	
	var collection = db.collection(seq.opts && seq.opts.collname ? seq.opts.collname : 'counters');
	collection.insert({_id : name, sequence : 0 }, function(err){
		console.log('inserting sequence...');
		if (err && (err.code >= 11000 || err.code <11005)) {
			console.log('duplicate?');
			// this should be ok according to
			// http://docs.mongodb.org/manual/tutorial/create-an-auto-incrementing-field/
		} else if (err){
			throw err;
		}
	});
	
	return seq;
};

module.exports = MongoSequence;