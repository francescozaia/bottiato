var fs = require('fs'),
    _ = require('lodash'),
    voice = require('./voice.js'),
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
                    // se mandi un like, ti rimanda un like, altrimenti una gif
                    if (messageAttachments[i].type === "image") {
                        if (messageAttachments[i].payload["sticker_id"] && messageAttachments[i].payload["sticker_id"].toString() === "369239263222822") { //thumbup
                            this.sendTxt(senderID, "(Y)");
                        } else {
                            this.sendTextAndGif(senderID);
                        }
                    }
                }
            }
        }.bind(this));


    },
    sendTextAndGif: function (recipientId) {
        voice.sendTypingOn(recipientId);
        setTimeout(function() {
            voice.sendTypingOff(recipientId);
            var selectedImage = getRandomInt(1, 11);
            var txt = battiatoBeatsObject["descrizioniGif"][selectedImage];
            var immagine = "https://secure.canecanuto.com/" + selectedImage + ".gif";

            voice.sendTextMessage(recipientId, txt);
            voice.sendImageMessage(recipientId, immagine);
        }, getRandomTime());
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
        var rilancione = this.rilancione.bind(this);
        var getVoce = this.getVoce.bind(this);
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
                var chiarimento = getVoce(battiatoBeatsObject["chiarimenti"], chiarimentiUsati);
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

    getVoce: function(voci, vociUsate) {
        var vociDisponibili = _.difference(voci, vociUsate);
        // se ci sono ancora vociDisponibili, scelgo random tra quelle, altrimenti pesco tra tutte.
        return (vociDisponibili.length) ?
            vociDisponibili[Math.floor(Math.random() * vociDisponibili.length)] :
            "(finiti)" + voci[Math.floor(Math.random() * voci.length)];
    },

    rilancione: function (recipientId, rilancioniUsati) {
        var getVoce = this.getVoce.bind(this);
        setTimeout(function() {
            var rilancione = getVoce(battiatoBeatsObject["rilancioni"], rilancioniUsati);
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







