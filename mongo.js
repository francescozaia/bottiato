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
        this.update(userID);
        setTimeout(function() {
            collection.findOne({ "_id": userID }, callback);
        }, 1000);

    },
    update: function(userID, stringhe) {

        collection.findOne({ "_id": userID }, function(err, doc) {
            var canzoni = doc && doc.canzoni ? doc.canzoni : [];
            var rilancioni = doc && doc.rilancioni ? doc.rilancioni : [];
            var chiarimenti = doc && doc.chiarimenti ? doc.chiarimenti : [];
            if (stringhe) {
                /*
                console.log("INSERTING for userID: ", userID);
                console.log("Canzone: ", stringhe.canzone);
                console.log("Rilancione: ", stringhe.rilancione);
                console.log("Chiarimento: ", stringhe.chiarimento);
                */
                if (stringhe.canzone) {
                    canzoni.push(stringhe.canzone);
                }
                if (stringhe.rilancione) {
                    rilancioni.push(stringhe.rilancione);
                }
                if (stringhe.chiarimento) {
                    chiarimenti.push(stringhe.chiarimento);
                }
            }
            collection.update(
                { "_id": userID },
                {
                    $set: {
                        "canzoni": canzoni,
                        "rilancioni": rilancioni,
                        "chiarimenti": chiarimenti
                    }
                },
                { upsert: true }
            );
        });
    }
}