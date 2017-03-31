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
        case 'generic':
          sendGenericMessage(senderID);
          break;
        case 'cantami':
        case 'Cantami':
          sendCanzone(senderID);
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
            elements: [{
              title: "rift",
              subtitle: "Next-generation virtual reality",
              item_url: "https://www.oculus.com/en-us/rift/",
              image_url: "http://messengerdemo.parseapp.com/img/rift.png",
              buttons: [{
                type: "web_url",
                url: "https://www.oculus.com/en-us/rift/",
                title: "Open Web URL"
              }, {
                type: "postback",
                title: "Call Postback",
                payload: "Payload for first bubble",
              }],
            }, {
              title: "touch",
              subtitle: "Your Hands, Now in VR",
              item_url: "https://www.oculus.com/en-us/touch/",
              image_url: "http://messengerdemo.parseapp.com/img/touch.png",
              buttons: [{
                type: "web_url",
                url: "https://www.oculus.com/en-us/touch/",
                title: "Open Web URL"
              }, {
                type: "postback",
                title: "Call Postback",
                payload: "Payload for second bubble",
              }]
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

    var canzone = canzoni[Math.floor(Math.random() * canzoni.length)];
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







