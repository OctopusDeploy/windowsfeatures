var path = require('path');
var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.render('index');
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT || 3000);