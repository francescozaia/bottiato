var MongoClient = require('mongodb').MongoClient;
// Connection url
var url = 'mongodb://localhost:27017/users';
// Connect using MongoClient
var collection;

module.exports = {
    connect: function () {
        MongoClient.connect(url, function(err, db) {
            collection = db.collection('users_collection');
        });
    },
    findAll: function () {
        collection.find().toArray(function(err, docs) {
            console.log(docs);
            //db.close();
        });
    }
}