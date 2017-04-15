var fs = require('fs'),
    voice = require('./voice.js');

var battiatoBeatsObject = JSON.parse(fs.readFileSync('/home/gituser/bottiato/json/battiato-beats.json', 'utf8'));

var getRandomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = {

    receivedMessage: function (event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfMessage = event.timestamp;
        var message = event.message;

        console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
        console.log(JSON.stringify(message));

        var messageId = message.mid;
        var messageText = message.text;
        var messageAttachments = message.attachments;

        if (messageText) {
            var cleaned = messageText.toLowerCase().replace(/!\?/g,'').trim();
            if (cleaned.match( /(ciao|buongiorno|hey|ei|yo|hei|ehilà)/ )) {
                this.sendSaluto(senderID);
            } else if (cleaned.match( /(foto|fotografia|immagine)/ )) {
                this.sendTextAndImg(senderID);
            } else if (cleaned.match( /(emoji)/ )) {
                this.sendEmoji(senderID);
            } else if (cleaned.match( /(video)/ )) {
                this.sendVideoMessage(senderID);
            } else {
                this.sendCanzone(senderID, cleaned);
            }
        } else if (messageAttachments) {
            for (var i=0; i<messageAttachments.length; i++) {
                if (messageAttachments[i].type === "image") {
                    console.log("-----"+messageAttachments[i].payload["sticker_id"])
                    if (messageAttachments[i].payload["sticker_id"] && messageAttachments[i].payload["sticker_id"].toString() === "369239263222822") { //thumbup
                        this.sendTxt(senderID, "(Y)");
                    } else {
                        this.sendTextAndImg(senderID);
                    }
                }
            }
        }
    },
    sendTextAndImg: function (recipientId) {

        voice.sendTypingOn(recipientId);
        setTimeout(function() {
            voice.sendTypingOff(recipientId);
            var selectedImage = getRandomInt(1, 47);
            var txt = battiatoBeatsObject["immagini_descriptions"][selectedImage];
            var immagine = "https://secure.canecanuto.com/" + selectedImage + ".jpg";

            voice.sendTextMessage(recipientId, txt);
            voice.sendImageMessage(recipientId, immagine);
        }, 2000);
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

    sendCanzone: function (recipientId, messageText) {

        voice.sendTypingOn(recipientId);

        var messageTextWordsArray = messageText.split(' ').filter(function (frase) {
            var word = frase.match(/(\w+)/);
            return word && word[0].length > 3;
        });
        var canzone = '';
        var filtered = [];
        filtered = battiatoBeatsObject["songs"].filter(function(item){
            for (var i = 0; i < messageTextWordsArray.length; i++) {
                var myPattern = new RegExp('\\b' + messageTextWordsArray[i] + '\\b', 'gi'); // ho aggiunto gli spazi
                var matches = item.match(myPattern);
                if (matches !== null) {
                    return true;
                }
            }
        });

        var canzone = filtered[0];
        var rilancione = this.rilancione();
        setTimeout(function() {
            voice.sendTypingOff(recipientId);
            if (!canzone || canzone === '') {
                // se non c'è corrispondenza vai di random su no_match
                canzone = battiatoBeatsObject["no_match"][Math.floor(Math.random() * battiatoBeatsObject["no_match"].length)];
                voice.sendTextMessage(recipientId, canzone);
            } else {
                voice.sendTextMessage(recipientId, canzone);
                if (Math.random() < 0.7) { // manda questo solo il 70% delle volte
                    rilancione(recipientId);
                }
            }
        }, 2000);

    },

    rilancione: function (recipientId) {
        setTimeout(function() {
            var rilancioneText = battiatoBeatsObject["more"][Math.floor(Math.random() * battiatoBeatsObject["more"].length)];
            voice.sendTextMessage(recipientId, rilancioneText);
        }, 2000);
    },

    sendGreetingText: function () {
        voice.sendGreeting();
    }

};







