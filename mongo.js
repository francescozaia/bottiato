var MongoClient = require('mongodb').MongoClient;
// Connection url
var url = 'mongodb://localhost:27017/users';
// Connect using MongoClient
MongoClient.connect(url, function(err, db) {

    var collection = db.collection('users_collection');

    collection.find().toArray(function(err, docs) {
        console.log(docs);

        db.close();
    });
});