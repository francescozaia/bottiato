var request = require('request');
var callSendAPI = require('sender/callSendAPI');
var callSendThreadSettings = require('sender/callSendThreadSettings');

var ACCESS_TOKEN = 'EAAawiwbXgjMBAD1AsneZBclfVpKiO5tEMmIvOxrro0ahgdicJARxiCg8QKlWgNvBtIrqiwZC4ZC7GwfMschadRdDtalTjFY8G8N9Ar4cRZCinTIAL1CPAZBuLIkQ6k3nrLoq0ncPd90yXuxQm4UsPZBraZCINZAz0GUUYHdD00PhzAZDZD';

module.exports = {

    getUserFirstName: function(id) {
        return new Promise(function (resolve, reject) {
            request({
                url: 'https://graph.facebook.com/v2.6/' + id,
                qs: {
                    fields: "first_name,last_name,profile_pic,locale,timezone,gender",
                    access_token: ACCESS_TOKEN
                },
                json: true
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

    sendGreeting: function() {
        var greetingData = {
            setting_type: "greeting",
            greeting: {
                text: "Ave a te {{user_first_name}}, come ti senti oggi?"
            }
        };
        callSendThreadSettings(greetingData);
    },

    sendImageMessage: function(recipientId, imageURL) {
        var messageData = {
            "recipient": {
                "id": recipientId
            },
            "message":{
                "attachment":{
                    "type":"image",
                    "payload":{
                        "url": imageURL
                    }
                }
            }
        };
        callSendAPI(messageData);
    },

    sendTextMessage: function(recipientId, text) {
        var messageData = {
            "recipient": {
                "id": recipientId
            },
            "message": {
                "text": text
            }
        };
        callSendAPI(messageData);
    },

    sendTypingOn: function(recipientId) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            sender_action: 'typing_on'
        };

        callSendAPI(messageData);
    },

    sendTypingOff: function(recipientId) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            sender_action: 'typing_off'
        };

        callSendAPI(messageData);
    }

};







