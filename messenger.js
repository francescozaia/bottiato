var request = require('request'),
    fs = require('fs');

var obj = JSON.parse(fs.readFileSync('/home/gituser/bottiato/strofe.json', 'utf8'));

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
      switch (messageText.toLowerCase()) {
        case 'video':
          this.sendGenericMessage(senderID);
          break;
        default:
          //this.sendTextMessage(senderID, messageText);
          this.sendCanzone(senderID);
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
            elements: [{
              title: "Cuccurucucu",
              image_url: "https://secure.canecanuto.com/canzone-cuccurucucu.jpg",
              buttons: [{
                type: "web_url",
                url: "https://www.youtube.com/watch?v=GuB3f70cYnM",
                title: "Vediti il video"
              }],
            }]
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







