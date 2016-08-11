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

// http basic auth http://stackoverflow.com/a/3905553/1181387
// http request error handling http://stackoverflow.com/a/19332541/1181387
app.post(secrets.path, function (hook_req, hook_res) {
  var send_req = https.request({
    hostname: 'api.mailgun.net',
    path: '/v3/clive.io/messages',
    method: 'POST',
    headers:{
      'Authorization': 'Basic ' + new Buffer('api:' + secrets.apikey).toString('base64')
    }
  }, function(send_res){
    if(('' + send_req.statusCode).match(/^2\d\d$/)){
      console.log('sent');
      hook_res.send('sent');
    }else{
      console.error(send_req.statusCode);
      console.error(send_res);
      hook_res.send(500, 'error');
    }
  });

  send_req.write(qs.stringify({
    from: 'mailbot@clive.io',
    to: 'cc@clive.io',
    subject: 'Mailerr ' + hook_req.body['event'] + ": " + hook_req.body['recipient'],
    text: 'https://mailgun.com/app/logs/clive.io?event=failed-permanent&event=failed-temporary&event=complained&event=rejected\send_req\n' + JSON.stringify(hook_req.body)
  }));

  send_req.on('error', function(e){
    console.error(e.message);
    hook_res.send(500, 'error');
  });

  send_req.on('timeout', function(){
    console.log('timeout');
    hook_res.send(500, 'timeout');
    send_req.abort();
  });
  
  send_req.setTimeout(5000);
  send_req.end();
});

app.listen(PORT, 'localhost', function(){
  console.log('Listening on localhost:' + PORT);
});
