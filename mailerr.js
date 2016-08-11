var secrets = require('./secrets.js');
var app = require('express')();
var exec = require('child_process').exec;
var PORT = 55923;
var helmet = require('helmet');
var multipart = require('connect-multiparty');
var https = require('https');
var qs = require('querystring');

app.use(helmet());
app.use(multipart());

app.post(secrets.path, function (req, res) {
  var r = https.request({
    hostname: 'api.mailgun.net',
    path: '/v3/clive.io/messages',
    method: 'POST',
    headers:{
      'Authorization': 'Basic ' + new Buffer('api:' + secrets.apikey).toString('base64')
    }
  }, function(){
    console.log('sent');
    res.send('sent');
  });
  
  r.write(qs.stringify({
    from: 'mailbot@clive.io',
    to: 'cc@clive.io',
    subject: 'Mailerr ' + req.body['event'] + ": " + req.body['recipient'],
    text: 'https://mailgun.com/app/logs/clive.io?event=failed-permanent&event=failed-temporary&event=complained&event=rejected\r\n' + JSON.stringify(req.body)
  });
  
  r.on('error', function(e){
    console.error(e.message);
    res.end();
  });
  
  r.end();
});

app.listen(PORT, 'localhost', function(){
  console.log('Listening on localhost:' + PORT);
});
