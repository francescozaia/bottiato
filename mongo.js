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
    findOne: function(userID, callback) {
        console.log(userID, callback);
        collection.findOne({ "_id": userID }, callback);
    },
    insert: function(userID) {
        collection.insert({userID:userID, words: []});
    },
    update: function(userID, words) {
        console.log("inserting: " +userID+ " " + words);
        // ensure words is an array
        var arr = [];
        if( typeof words === 'string' ) {
            arr.push = words;
        } else {
            arr = words;
        }
        collection.update( { "_id": userID },
                { "words": arr },
                { upsert: true } );
    }
}