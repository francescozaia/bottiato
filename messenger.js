var request = require('request'),
  fs = require('fs');

var obj = JSON.parse(fs.readFileSync('/home/gituser/bottiato/frasi.json', 'utf8'));

module.exports = {

  receivedMessage: function (event) {
    console.log("Message data: ", event.message);
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

      // If we receive a text message, check to see if it matches a keyword
      // and send back the example. Otherwise, just echo the text we received.
      switch (messageText) {
        case 'mostra':
        case 'Mostra':
        case 'mostrami':
        case 'Mostrami':
          this.sendGenericMessage(senderID);
          break;
        case 'canta':
        case 'Canta':
        case 'cantami':
        case 'Cantami':
          this.sendCanzone(senderID);
          break;
        default:
          this.sendTextMessage(senderID, messageText);
      }
    } else if (messageAttachments) {
      this.sendTextMessage(senderID, "Message with attachment received");
    }
  },

  sendGenericMessage: function (recipientId) {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [
              {
                "title": "Welcome to Peter\'s Hats",
                "image_url": "https://petersfancybrownhats.com/company_image.png",
                "subtitle": "We\'ve got the right hat for everyone.",
                "default_action": {
                  "type": "web_url",
                  "url": "https://peterssendreceiveapp.ngrok.io/view?item=103",
                  "messenger_extensions": true,
                  "webview_height_ratio": "tall",
                  "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                },
                "buttons": [
                  {
                    "type": "web_url",
                    "url": "https://petersfancybrownhats.com",
                    "title": "View Website"
                  }, {
                    "type": "postback",
                    "title": "Start Chatting",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD"
                  }
                ]
              }
            ]
          }
        }
      }
    };

    this.callSendAPI(messageData);
  },

  sendTextMessage: function (recipientId, messageText) {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        text: messageText
      }
    };

    this.callSendAPI(messageData);
  },

  sendCanzone: function (recipientId) {
    var canzoni = [
      "Ho avuto molte donne in vita mia, e in ogni camera ho lasciato qualche mia energia.",
      "E giorni di digiuno e di silenzio, per fare i cori nelle messe tipo Amanda Lear.",
      "Le barricate in piazza le fai per conto della borghesia, che crea falsi miti di progresso.",
      "Segnali di vita nei cortili e nelle case all'imbrunire, le luci fanno ricordare le meccaniche celesti."
    ];

    canzoni = obj;

    var canzone = canzoni[Math.floor(Math.random() * canzoni.length)].strofa;
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        text: canzone
      }
    };
    this.callSendAPI(messageData);
  },

  callSendAPI: function callSendAPI(messageData) {
    request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: 'EAAawiwbXgjMBAD1AsneZBclfVpKiO5tEMmIvOxrro0ahgdicJARxiCg8QKlWgNvBtIrqiwZC4ZC7GwfMschadRdDtalTjFY8G8N9Ar4cRZCinTIAL1CPAZBuLIkQ6k3nrLoq0ncPd90yXuxQm4UsPZBraZCINZAz0GUUYHdD00PhzAZDZD' },
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







