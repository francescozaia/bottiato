var fs = require('fs'),
    lStorage = require('./storage/localStorage.js'),
    voice = require('./voice.js');
    mongo = require('./mongo.js');

mongo.connect();

var battiatoBeatsObject = JSON.parse(fs.readFileSync('/home/gituser/bottiato/json/battiato-beats.json', 'utf8'));

var getRandomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

var getRandomTime = function() {
    return Math.floor(Math.random() * (4000 - 1000)) + 1000;
};
/*lStorage.save("messengerBotData", {
    "no_match": 0
}, 60 * 24);*/

module.exports = {

    receivedMessage: function (event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfMessage = event.timestamp;
        var message = event.message;

        //console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
        console.log(JSON.stringify(message));

        var messageId = message.mid;
        var messageText = message.text;
        var messageAttachments = message.attachments;

        // mongo.insertOne(senderID);
        mongo.findOne(senderID, function(err, doc) {
            console.log("DOC", doc)
            if (messageText) {
                var cleaned = messageText.toLowerCase().replace(/!\?/g,'').trim();
                /*if (cleaned.match( /(ciao|buongiorno|hey|ei|yo|hei|ehilà)/ )) {
                 this.sendSaluto(senderID);
                 } else*/
                if (cleaned.match( /(foto|fotografia|immagine)/ )) {
                    this.sendTextAndImg(senderID);
                } else if (cleaned.match( /(emoji)/ )) {
                    this.sendEmoji(senderID);
                } else if (cleaned.match( /(video)/ )) {
                    this.sendVideoMessage(senderID);
                } else {
                    this.sendCanzone(senderID, cleaned, doc.canzoni, doc.rilancioni, doc.chiarimenti);
                }
            } else if (messageAttachments) {
                for (var i=0; i<messageAttachments.length; i++) {
                    if (messageAttachments[i].type === "image") {
                        if (messageAttachments[i].payload["sticker_id"] && messageAttachments[i].payload["sticker_id"].toString() === "369239263222822") { //thumbup
                            this.sendTxt(senderID, "(Y)");
                        } else {
                            this.sendTextAndImg(senderID);
                        }
                    }
                }
            }
        }.bind(this));


    },
    sendTextAndImg: function (recipientId) {

        voice.sendTypingOn(recipientId);
        setTimeout(function() {
            voice.sendTypingOff(recipientId);
            var selectedImage = getRandomInt(1, 47);
            var txt = battiatoBeatsObject["descrizioniImmagini"][selectedImage];
            var immagine = "https://secure.canecanuto.com/" + selectedImage + ".jpg";

            voice.sendTextMessage(recipientId, txt);
            voice.sendImageMessage(recipientId, immagine);
        }, getRandomTime());
    },
    sendTxt: function (recipientId, txt) {
        voice.sendTextMessage(recipientId, txt);
    },
    sendEmoji: function (recipientId) {
        var emoji = battiatoBeatsObject["emoji"][Math.floor(Math.random() * battiatoBeatsObject["emoji"].length)];
        voice.sendTextMessage(recipientId, emoji);
    },
    sendSaluto: function (recipientId) {
        var rilancione = this.rilancione;
        var promise = voice.getUserFirstName(recipientId);
        promise.then(function(nomeUtente){
            voice.sendTextMessage(recipientId, "Un saluto a te, " + nomeUtente + ".");
            rilancione(recipientId);
        });
    },
    sendVideoMessage: function (recipientId) {
        /*voice.callSendAPI({
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [{
                            title: "Cuccurucucu",
                            image_url: "https://secure.canecanuto.com/canzone-cuccurucucu.jpg",
                            buttons: [{
                                type: "web_url",
                                url: "https://www.youtube.com/watch?v=GuB3f70cYnM",
                                title: "Vediti il video"
                            }]
                        }]
                    }
                }
            }
        });*/
    },

    sendCanzone: function (recipientId, messageText, canzoniUsate, rilancioniUsati, chiarimentiUsati) {
        var rilancione = this.rilancione;
        var getRandomChiarimento = this.getRandomChiarimento;
        var messageTextWordsArray = messageText.split(' ').filter(function (frase) {
            var word = frase.match(/(\w+)/);
            return word && word[0].length > 3;
        });
        var canzone = '';
        var filtered = [];

        voice.sendTypingOn(recipientId);

        filtered = battiatoBeatsObject["canzoni"].filter(function(item){
            for (var i = 0; i < messageTextWordsArray.length; i++) {
                var myPattern = new RegExp('\\b' + messageTextWordsArray[i] + '\\b', 'gi'); // ho aggiunto gli spazi
                var matches = item.match(myPattern);
                if (matches !== null) {
                    return true;
                }
            }
        });

        var canzoneTrovata = filtered[0]; //mettere un random tra i match "ciao"

        setTimeout(function() {
            voice.sendTypingOff(recipientId);
            if (!canzoneTrovata || canzoneTrovata === '' || canzoniUsate.indexOf(canzoneTrovata) > -1) {
                // se non c'è corrispondenza vai di random su chiarimenti
                var chiarimento = getRandomChiarimento(recipientId, battiatoBeatsObject["chiarimenti"], chiarimentiUsati);
                voice.sendTextMessage(recipientId, chiarimento);
                mongo.update(recipientId, {
                    canzone: null,
                    rilancione: null,
                    chiarimento: chiarimento
                });
            } else {
                voice.sendTextMessage(recipientId, canzoneTrovata);
                mongo.update(recipientId, {
                    canzone: canzoneTrovata,
                    rilancione: null,
                    chiarimento: null
                });
                if (Math.random() < 0.7) { // manda questo solo il 70% delle volte
                    rilancione(recipientId, rilancioniUsati);
                }
            }

        }, getRandomTime());

    },

    getRandomChiarimento: function(recipientId, chiarimenti, chiarimentiUsati) {
        var c = chiarimenti[Math.floor(Math.random() * chiarimenti.length)];
        if (chiarimentiUsati.indexOf(c) > -1) {
            var trovato = chiarimentiUsati[chiarimentiUsati.indexOf(c)];
            console.log("trovato: ",trovato);
            if (chiarimenti.length > 1) {
                this.getRandomChiarimento(chiarimenti.remove(trovato));
            } else {
                mongo.update(recipientId, {
                    canzone: null,
                    rilancione: null,
                    chiarimento: []
                });
            }

        }
        return c;
    },

    rilancione: function (recipientId, rilancioniUsati) {
        console.log(">>>>",rilancioniUsati)
        setTimeout(function() {
            var rilancione = battiatoBeatsObject["rilancioni"][Math.floor(Math.random() * battiatoBeatsObject["rilancioni"].length)];
            voice.sendTextMessage(recipientId, rilancione);
            mongo.update(recipientId, {
                canzone: null,
                rilancione: rilancione,
                chiarimento: null
            });
        }, getRandomTime());
    },

    sendGreetingText: function () {
        // is this needed? voice.sendGreeting();
    }

};







