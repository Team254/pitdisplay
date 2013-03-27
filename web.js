var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var team="254";
  var ev="casd";
  var baseurl="http://chiefdelphi.com/forums/frcspy.php?xml=2";
  var cdurl=baseurl+"&teams="+team+"&events="+ev;
  var refresh=10;
  $.get(url,function(xml) {
  var json = $.xml2json(xml);
  console.log(json);
  response.send(json);
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
