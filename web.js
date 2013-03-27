var express = require("express");
var http = require("http");
var cheerio = require("cheerio");

var app = express.createServer(express.logger());
app.set('views', __dirname + '/views')
app.set('view options', {
      layout: false
});
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res) {
  var year = req.query.year || "2013"
  var refresh=parseInt(req.query.refresh) || 10;
  var team=req.query.team || "254";
  var ev=req.query.event || "casd";
  var elims=parseInt(req.query.elims) || 0;
  http.get({
            host: "www2.usfirst.org",
            path: "/"+year+"comp/events/"+ev+"/matchresults.html"
           },
           function(response) {
             var str="";
             response.on("data", function(chunk) {
               str += chunk;
             });
             response.on('end', function() {
                 $ = cheerio.load(str);
                 var tables = $("table tbody");
                 var table = elims ? tables[3] : tables[2];
                 var rows = $(table).children();
                 var data = [];
                 for(var i=3;i<rows.length;i++) {
                   var row = rows[i];
                   var rowdata = $(row).children();
                   data.push({time: $(rowdata[0]).text(),
                             match: $(rowdata[1]).text(),
                             red1: $(rowdata[2]).text(),
                             red2: $(rowdata[3]).text(),
                             red3: $(rowdata[4]).text(),
                             blue1: $(rowdata[5]).text(),
                             blue2: $(rowdata[6]).text(),
                             blue3: $(rowdata[7]).text(),
                             redscore: $(rowdata[8]).text(),
                             bluescore: $(rowdata[9]).text()});
                 }
                 dest = 0;
                 refresh = 30000;
                 //res.send("<html><head><title>yeah buddy</title></head><body><"+display+"></body></html>");
                 res.render('display', {team: team, data: data, dest: dest, refresh: refresh});
             });
           }
  );
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
