var express = require('express');
var app = express();
var batch = require('./lib/batch');

app.set('port', process.env.PORT || 8080);
app.disable('x-powered-by');

app.get('/', function(req, res) {
  res.set('Content-Type', 'text/plain');
  res.send('This is not the page you are looking for.');
});

app.get('/data', function(req, res) {
  batch(function(err, items) {
    if (err) return res.json(err);
    res.json(items);
  });
});

app.listen(app.get('port'));
