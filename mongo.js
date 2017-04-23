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
    update: function(userID, stringhe) {
        console.log("inserting: " +userID+ " " + stringhe.canzone + " " + stringhe.rilancione);
        collection.findOne({ "_id": userID }, function(err, doc) {
            var canzoni = doc.canzoni ? doc.canzoni : [];
            var rilancioni = doc.rilancioni ? doc.rilancioni : [];
            if (stringhe.canzone) {
                canzoni.push(stringhe.canzone);
            }
            if (stringhe.rilancione) {
                rilancioni.push(stringhe.rilancione);
            }
            console.log("canzoni:", canzoni);
            console.log("rilancioni:", rilancioni);
            collection.update(
                { "_id": userID },
                { "canzoni": canzoni },
                { "rilancioni": rilancioni },
                { upsert: true }
            );
        });
    }
}