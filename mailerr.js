var apikey = require('./secrets.js');
var app = require('express')();
var PORT = 55923;
var helmet = require('helmet');
var multipart = require('connect-multiparty');
var crypto = require('crypto');
var mg = new (require('mailgun').Mailgun)(apikey);

app.use(helmet());
app.use(multipart());

// http basic auth http://stackoverflow.com/a/3905553/1181387
// http request error handling http://stackoverflow.com/a/19332541/1181387
app.post('/mailerr', function (hook_req, hook_res) {
  var hmac = crypto.createHmac('sha256', apikey);
  hmac.update('' + hook_req.body.timestamp + hook_req.body.token);
  if(hook_req.body.signature != hmac.digest('hex')){
    hook_res.send(401, 'Unauthorized');
    return;
  }
  
  mg.sendText('mailbot@clive.io',
              'cc@clive.io',
              'Mailerr ' + hook_req.body.event + ": " + hook_req.body.recipient,
              'https://mailgun.com/app/logs/clive.io?event=failed-permanent&event=failed-temporary&event=complained&event=rejected\r\n\r\n' + JSON.stringify(hook_req.body, null, 2),
              'clive.io',
              {},
              function(err){
                if(err){
                  console.err('API response code '+err);
                  hook_res.status(500).send('error');
                }else{
                  console.log('sent');
                  hook_res.send('sent');
                }
              });
});

app.listen(PORT, 'localhost', function(){
  console.log('Listening on localhost:' + PORT);
});
