Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


var bodyParser = require('body-parser'),
    path = require('path'),
    crypto = require('crypto'),
    tls = require('tls'),
    express = require('express'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    messenger = require('./messenger.js'),
    mongo = require('./mongo.js');

mongo.connect();

var app = express();

app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('🐶');
});

// webhook get
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'up_patriots_to_arms') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

// webhook post
app.post('/webhook', bodyParser.json(), function (req, res) {
	var data = req.body;
  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          messenger.receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

// HTTPS certificates
var privateKey = fs.readFileSync("/home/gituser/letsencrypt/live/secure.canecanuto.com/privkey.pem").toString();
var certificate = fs.readFileSync("/home/gituser/letsencrypt/live/secure.canecanuto.com/fullchain.pem").toString();
var chain = fs.readFileSync("/home/gituser/letsencrypt/live/secure.canecanuto.com/chain.pem").toString();

// Create an HTTP service.
http.createServer(app).listen(3000);
// Create an HTTPS service identical to the HTTP service.
/*https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(443);*/

messenger.sendGreetingText();
