var request = require('request');

var ACCESS_TOKEN = 'EAAawiwbXgjMBAD1AsneZBclfVpKiO5tEMmIvOxrro0ahgdicJARxiCg8QKlWgNvBtIrqiwZC4ZC7GwfMschadRdDtalTjFY8G8N9Ar4cRZCinTIAL1CPAZBuLIkQ6k3nrLoq0ncPd90yXuxQm4UsPZBraZCINZAz0GUUYHdD00PhzAZDZD';

var callSendAPI = function (messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: ACCESS_TOKEN},
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;
            console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}
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

    callGreetingApi: function (data) {
        request({
            uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
            qs: {access_token: ACCESS_TOKEN},
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

    sendTextMessage: function(recipientId, text) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: text
            }
        }
        callSendAPI(messageData);
    }

};







