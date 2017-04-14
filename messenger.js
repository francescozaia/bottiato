var fs = require('fs'),
    voice = require('./voice.js');

var battiatoBeatsObject = JSON.parse(fs.readFileSync('/home/gituser/bottiato/json/battiato-beats.json', 'utf8'));

module.exports = {

    probability: function () {
        return (Math.random() < 0.5);
    },

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
            switch (messageText.toLowerCase().replace(/!/g,'').trim()) {
                case 'ciao':
                case 'buongiorno':
                case 'hey':
                case 'ei':
                case 'hei':
                case 'ehi':
                case 'ehilà':
                    this.sendSaluto(senderID);
                    break;
                case 'emoji':
                    this.sendEmoji(senderID);
                    break;
                case 'video':
                    this.sendVideoMessage(senderID);
                    break;
                case 'special':
                    this.sendSpecialMessage(senderID, messageText);
                    break;
                default:
                    this.sendCanzone(senderID, messageText);
            }
        } else if (messageAttachments) {
            this.sendSimpleTextMessage(senderID, "Che si fa con i messaggi speciali tipo adesso?");
        }
    },
    sendEmoji: function (recipientId) {
        var emoji = battiatoBeatsObject["emoji"][Math.floor(Math.random() * battiatoBeatsObject["emoji"].length)];
        voice.sendTextMessage(recipientId, emoji);
    },
    sendSaluto: function (recipientId) {
        var promise = voice.getUserFirstName(recipientId);
        promise.then(function(nomeUtente){
            voice.sendTextMessage(recipientId, "Un saluto a te, " + nomeUtente + ".");

            setTimeout(function() {
                var rilancione = battiatoBeatsObject["more"][Math.floor(Math.random() * battiatoBeatsObject["more"].length)];
                voice.sendTextMessage(recipientId, rilancione);
            }, 2000);

        });
    },
    sendVideoMessage: function (recipientId) {
        voice.callSendAPI({
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
        });
    },

    sendSimpleTextMessage: function (recipientId, messageText) {
        voice.sendTextMessage(recipientId, messageText);
    },

    sendSpecialMessage: function (recipientId, messageText) {
        voice.sendTextMessage(recipientId, messageText + " yo!");
    },

    sendCanzone: function (recipientId, messageText) {
        function filteringCondition(item) {
            for (var i = 0; i < messageTextWordsArray.length; i++) {
                var myPattern = new RegExp('\\b' + messageTextWordsArray[i] + '\\b', 'gi'); // ho aggiunto gli spazi
                var matches = item.match(myPattern);
                if (matches !== null) {
                    return true;
                }
            }
        }

        var messageTextWordsArray = messageText.split(' ').filter(function (frase) {
            var word = frase.match(/(\w+)/);
            return word && word[0].length > 3;
        });

        var filtered = [];
        filtered = battiatoBeatsObject["songs"].filter(filteringCondition);

        var canzone = filtered[0];

        if (!canzone || canzone === '') {
            // se non c'è corrispondenza vai di random
            canzone = battiatoBeatsObject["songs"][Math.floor(Math.random() * battiatoBeatsObject["songs"].length)];
        }

        voice.sendTextMessage(recipientId, canzone);

        if (this.probability()) { // manda questo solo il 50% delle volte
            setTimeout(function() {
                var rilancione = battiatoBeatsObject["more"][Math.floor(Math.random() * battiatoBeatsObject["more"].length)];
                voice.sendTextMessage(recipientId, rilancione);
            }, 2000);
        }
    },

    sendGreetingText: function () {
        var greetingData = {
            setting_type: "greeting",
            greeting: {
                text: "Ave a te {{user_first_name}}, come ti senti oggi?"
            }
        };
        voice.callGreetingApi(greetingData);
    }

};







