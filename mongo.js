var MongoClient = require('mongodb').MongoClient;
// Connection url
var url = 'mongodb://localhost:27017/users';
// Connect using MongoClient
var collection;

module.exports = {
    connect: function() {
        MongoClient.connect(url, function(err, db) {
            collection = db.collection('users_collection');
        });
    },
    findAll: function() {
        collection.find().toArray(function(err, docs) {
            console.log(docs);
            //db.close();
        });
    },
    insertOne: function(userID) {
        collection.insert({userID:userID, received: []});
    },
    update: function(userID, words) {
        console.log("inserting: " +userID+ " " + words);
        collection.update( { "_id.name": "Francesco Zaia", "_id.uid": userID },
                { "words": words },
                { upsert: true } );
    }
}