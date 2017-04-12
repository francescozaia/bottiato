var request = require('request'),
    fs = require('fs');

var battiatoBeatsObject = JSON.parse(fs.readFileSync('/home/gituser/bottiato/json/battiato-beats.json', 'utf8'));

module.exports = {

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
      switch (messageText.toLowerCase()) {
        case 'video':
          this.sendVideoMessage(senderID);
          break;
        case 'special':
          this.sendSpecialMessage(senderID);
          break;
        default:
          //this.sendTextMessage(senderID, messageText);
          this.sendCanzone(senderID, messageText);
      }
    } else if (messageAttachments) {
      this.sendTextMessage(senderID, "Che si fa con i messaggi speciali tipo adesso?");
    }
  },

  sendVideoMessage: function (recipientId) {
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

    sendSpecialMessage: function (recipientId, messageText) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText
            }
        };

        this.callSendAPI(messageData);
        var lancione = battiatoBeatsObject["more"][Math.floor(Math.random() * battiatoBeatsObject["more"].length)];
        console.log("lancione: " + lancione);

        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: lancione
            }
        };
        this.callSendAPI(lancione);
    },

  sendCanzone: function (recipientId, messageText) {

    function filteringCondition(item) {
      for (var i = 0; i<messageTextWordsArray.length; i++) {
          var myPattern = new RegExp('\\b'+ messageTextWordsArray[i] +'\\b','gi'); // ho aggiunto gli spazi
          var matches = item.match(myPattern);
          if (matches !== null) {
              return true;
          }
      }
    }

    var messageTextWordsArray = messageText.split(' ').filter(function ( frase ) {
        var word = frase.match(/(\w+)/);
        return word && word[0].length > 3;
    });

    var filtered = [];
    filtered = battiatoBeatsObject["songs"].filter(filteringCondition);

    var canzone = filtered[0];

    if (!canzone || canzone === '') canzone = "Che si fa quando non c'è una corrispondenza tipo adesso?";

    //var canzone = battiatoBeatsObject["songs"][Math.floor(Math.random() * battiatoBeatsObject["songs"].length)];
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







