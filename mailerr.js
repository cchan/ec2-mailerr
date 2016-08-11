var secrets = require('./secrets.js');
var app = require('express')();
var exec = require('child_process').exec;
var PORT = 55923;
var helmet = require('helmet');
var multipart = require('connect-multiparty');
var http = require('http');

app.use(helmet());
app.use(multipart());

app.post(secrets.path, function (req, res) {
  var event = req.body['event'].replace(/\W/g, '');
  var recip = req.body['recipient'].replace(/[^0-9a-zA-Z@\./g, '');
  var client = http.createClient(80, secrets.mailapi);
  var request = client.request('POST', secrets.apiroute, {
    'Host': secrets.mailapi,
    'Authorization': 'Basic ' + new Buffer(secrets.apiuser + ':' + secrets.apikey).toString('base64')
  });

  + " -F from='"            + secrets.mailbot + "'"
  + " -F to='"              + secrets.recipients + "'"
  + " -F subject='Mailerr " + event + ": " + recip + "'"
  + " -F text='"            + event + ": " + recip + "\r\n" + secrets.response + "'",
  function(error, stdout, stderr){
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    else{
      res.send('stdout: '+ stdout + '\r\nstderr: ' + stderr);
      res.end();
    }
  });
});

app.listen(PORT, 'localhost', function(){
  console.log('Listening on localhost:' + PORT);
});
