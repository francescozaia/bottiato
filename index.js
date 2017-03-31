

var bodyParser = require('body-parser'),
    path = require('path'),
    crypto = require('crypto'),
    tls = require('tls'),
    express = require('express'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    messenger = require('./messenger.js');

var app = express();

var privateKey = fs.readFileSync('/home/gituser/letsencrypt/live/secure.canecanuto.com/privkey.pem').toString();
var certificate = fs.readFileSync('/home/gituser/letsencrypt/live/secure.canecanuto.com/fullchain.pem').toString();
var chain = fs.readFileSync('/home/gituser/letsencrypt/live/secure.canecanuto.com/chain.pem').toString();

var secureOptions = {
 key: privateKey,
 cert: certificate
}

app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'up_patriots_to_arms') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

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
  

// Create an HTTP service.
http.createServer(app).listen(80);
// Create an HTTPS service identical to the HTTP service.
https.createServer(secureOptions, app).listen(443);
