var request = require('request'),
    winston = require('winston');

var PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
    (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
    'EAAawiwbXgjMBAD1AsneZBclfVpKiO5tEMmIvOxrro0ahgdicJARxiCg8QKlWgNvBtIrqiwZC4ZC7GwfMschadRdDtalTjFY8G8N9Ar4cRZCinTIAL1CPAZBuLIkQ6k3nrLoq0ncPd90yXuxQm4UsPZBraZCINZAz0GUUYHdD00PhzAZDZD';

module.exports = function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: messageData,
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;
            if (messageId) {
                winston.info('Successfully sent message with id ' + messageId + ' to recipient: ' + recipientId);
            } else {
                winston.info('Successfully called Send API for recipient: ' + recipientId);
            }
        } else {
            winston.info(
                'Failed calling Send API',
                response.statusCode,
                response.statusMessage,
                body.error
            );

        }
    });
};