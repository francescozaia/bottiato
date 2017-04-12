var request = require('request'),
    fs = require('fs');

var battiatoBeatsObject = JSON.parse(fs.readFileSync('/home/gituser/bottiato/json/battiato-beats.json', 'utf8'));

module.exports = {

    getUserFirstName:function(id) {
        var usersPublicProfile = 'https://graph.facebook.com/v2.6/' + id + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=EAAawiwbXgjMBAD1AsneZBclfVpKiO5tEMmIvOxrro0ahgdicJARxiCg8QKlWgNvBtIrqiwZC4ZC7GwfMschadRdDtalTjFY8G8N9Ar4cRZCinTIAL1CPAZBuLIkQ6k3nrLoq0ncPd90yXuxQm4UsPZBraZCINZAz0GUUYHdD00PhzAZDZD';


        return new Promise(function (resolve, reject) {
            request({
                url: usersPublicProfile,
                json: true // parse
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log('Hi ' + body.first_name);
                    resolve(body.first_name, id)
                } else {
                    return reject(error)
                }
            });
        })
    },

    receivedMessage: function (event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfMessage = event.timestamp;
        var message = event.message;

        console.log("Received message for user %d and page %d at %d with message:",
            senderID, recipientID, timeOfMessage);
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
    sendSaluto: function (recipientId) {
        var c = this.callSendAPI;
        var promise = this.getUserFirstName(recipientId);
        promise.then(function(uno){
            console.log("inside" + uno + "..." + recipientId);
            c({
                recipient: {
                    id: recipientId
                },
                message: {
                    text: "Ciao " + uno
                }
            });

            var rilancione = battiatoBeatsObject["more"][Math.floor(Math.random() * battiatoBeatsObject["more"].length)];

            c({
                recipient: {
                    id: recipientId
                },
                message: {
                    text: rilancione
                }
            });
        });
    },
    sendVideoMessage: function (recipientId) {
        this.callSendAPI({
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
        this.callSendAPI({
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText
            }
        });
    },

    sendSpecialMessage: function (recipientId, messageText) {
        this.callSendAPI({
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText + " yo!"
            }
        });
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

        this.callSendAPI({
            recipient: {
                id: recipientId
            },
            message: {
                text: canzone
            }
        });

        var rilancione = battiatoBeatsObject["more"][Math.floor(Math.random() * battiatoBeatsObject["more"].length)];

        this.callSendAPI({
            recipient: {
                id: recipientId
            },
            message: {
                text: rilancione
            }
        });
    },

    sendGreetingText: function () {
        var greetingData = {
            setting_type: "greeting",
            greeting: {
                text: "Ave a te {{user_first_name}}, come ti senti oggi?"
            }
        };
        this.createGreetingApi(greetingData);
    },
    createGreetingApi: function (data) {
        request({
            uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
            qs: {access_token: 'EAAawiwbXgjMBAD1AsneZBclfVpKiO5tEMmIvOxrro0ahgdicJARxiCg8QKlWgNvBtIrqiwZC4ZC7GwfMschadRdDtalTjFY8G8N9Ar4cRZCinTIAL1CPAZBuLIkQ6k3nrLoq0ncPd90yXuxQm4UsPZBraZCINZAz0GUUYHdD00PhzAZDZD'},
            method: 'POST',
            json: data

        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("Greeting set successfully!");
            } else {
                console.error("Failed calling Thread Reference API", response.statusCode, response.statusMessage, body.error);
            }
        });
    },

    callSendAPI: function callSendAPI(messageData) {
        request({
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: 'EAAawiwbXgjMBAD1AsneZBclfVpKiO5tEMmIvOxrro0ahgdicJARxiCg8QKlWgNvBtIrqiwZC4ZC7GwfMschadRdDtalTjFY8G8N9Ar4cRZCinTIAL1CPAZBuLIkQ6k3nrLoq0ncPd90yXuxQm4UsPZBraZCINZAz0GUUYHdD00PhzAZDZD'},
            method: 'POST',
            json: messageData

        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var recipientId = body.recipient_id;
                var messageId = body.message_id;

                console.log("Successfully sent generic message with id %s to recipient %s",
                    messageId, recipientId);
            } else {
                console.error("Unable to send message.");
                console.error(response);
                console.error(error);
            }
        });
    }

};







