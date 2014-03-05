var express = require("express");
var http = require("http");
var cheerio = require("cheerio");
var fs = require("fs");

var lastTime=0;
var app = express.createServer(express.logger());
app.set('views', __dirname + '/views')
app.set('view options', {
      layout: false
});
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/public'))
app.get('/', function(req, res) {
  res.render('config');
});

app.get('/casj', function(req, res) {
  var test = parseInt(req.query.test) || 0;
  var team=req.query.team || "254";
  var refresh=parseInt(req.query.refresh)*1000 || 30000;
  var elims = false;
  fs.readFile("casj.html", "utf8", function(err,str) {
   $ = cheerio.load(str);
   var tables = $("table");
   var table = elims ? tables[3] : tables[2];
   console.log(tables);
   var rows = $(table).children();
   var data = [];
   for(var i=2;i<rows.length;i++) {
     var row = rows[i];
     var rowdata = $(row).children();
     data.push({time: $(rowdata[0]).text(),
               match: $(rowdata[1]).text(),
               red1: $(rowdata[2+elims]).text(),
               red2: $(rowdata[3+elims]).text(),
               red3: $(rowdata[4+elims]).text(),
               blue1: $(rowdata[5+elims]).text(),
               blue2: $(rowdata[6+elims]).text(),
               blue3: $(rowdata[7+elims]).text(),
               redscore: $(rowdata[8+elims]).text(),
               bluescore: $(rowdata[9+elims]).text()});
   }
   res.render('display', {test: test, team: team, data: data, refresh: refresh});
  });
});

app.get('/rank', function(req, res) {
  var test = parseInt(req.query.test) || 0;
  var year = req.query.year || "2014"
  var refresh=parseInt(req.query.refresh)*1000 || 30000;
  var team=req.query.team || "254";
  var ev=req.query.event || "casj";
  var elims=parseInt(req.query.elims) || 0;
  http.get({
            host: "www2.usfirst.org",
            path: "/"+year+"comp/events/"+ev+"/rankings.html"
           },
           function(response) {
             var str="";
             response.on("data", function(chunk) {
               str += chunk;
             });
             response.on('end', function() {
                 $ = cheerio.load(str);
                 var tables = $("table tbody");
                 var table = tables[2];
                 var rows = $($(table).children()[3]).children();
                 var data = [];
                 for(var i=0;i<rows.length;i++) {
                   var row = rows[i];
                   var rowdata = $(row).children();
                   console.log("HELLA "+i);
                   console.log(rowdata);
                   data.push({rank: $(rowdata[0]).text(),
                             team: $(rowdata[1]).text(),
                             qs: $(rowdata[2]).text(),
                             ap: $(rowdata[3]).text(),
                             cp: $(rowdata[4]).text(),
                             tp: $(rowdata[5]).text(),
                             record: $(rowdata[6]).text(),
                             dq: $(rowdata[7]).text(),
                             played: $(rowdata[8]).text()});
                 }
                 console.log(data);
                 res.render('rank', {test: test, team: team, data: data, refresh: refresh});
             });
           }
  ).on('error', function(e) {
    console.log("Couldn't connect to FIRST");
    res.send("Couldn't connect to FIRST",500);
  });
});
app.get('/display', function(req, res) {
  var test = (req.query.test !== undefined) ? parseInt(req.query.test) : Number.POSITIVE_INFINITY;
  var year = req.query.year || "2014"
  var refresh=parseInt(req.query.refresh)*1000 || 30000;
  var team=req.query.team || "254";
  var ev=req.query.event || "casj";
  var elims=parseInt(req.query.elims) ? 1 : 0;
  http.get({
            host: "www2.usfirst.org",
            path: "/"+year+"comp/events/"+ev+"/ScheduleQual.html"
           },
           function(response) {
             var str="";
             response.on("data", function(chunk) {
               str += chunk;
               console.log("swagger");
             });
             response.on('end', function() {
                 $ = cheerio.load(str);
                 var tables = $("div.Section1 table");
                 var table = elims ? tables[3] : tables[2];
                 var rows = $(table).children();
                 var data = [];
                 for(var i=3;i<rows.length;i++) {
                   var row = rows[i];
                   var rowdata = $(row).children();
                   console.log(rowdata);
                   data.push({time: $(rowdata[0]).text(),
                             match: $(rowdata[1]).text(),
                             red1: $(rowdata[2+elims]).text(),
                             red2: $(rowdata[3+elims]).text(),
                             red3: $(rowdata[4+elims]).text(),
                             blue1: $(rowdata[5+elims]).text(),
                             blue2: $(rowdata[6+elims]).text(),
                             blue3: $(rowdata[7+elims]).text(),
                             redscore: $(rowdata[8+elims]).text(),
                             bluescore: $(rowdata[9+elims]).text()});
                 }
                 res.render('display', {test: test, team: team, data: data, refresh: refresh});
             });
           }
  ).on('error', function(e) {
    console.log("Couldn't connect to FIRST");
    res.send("Couldn't connect to FIRST",500);
  });
});
app.get('/lights', function(req, res){
  if(lastTime != req.query["time"]) {
    text = "gametimer=true," + (req.query["team"] || "blue") 
      + "," + req.query["time"] 
      + "\noptions=customize\n " 
      + "color=0,0,255\n"
      + "pattern=solid\n"
      + "fadetime=3,5";

    fs.writefile("/users/bg/team254/pitdisplay/test.txt", time, function(err) {
      if(err) 
        console.log(err);
      else 
        console.log("win");
    }); 
    lastTime = req.query["time"];
  } else {
    text = "gametimer=false," + (req.query["team"] || "blue") 
      + "," + req.query["time"] 
      + "\noptions=customize\n " 
      + "color=0,0,255\n"
      + "pattern=solid\n"
      + "fadetime=3,5";

    fs.writefile("/users/bg/team254/pitdisplay/test.txt", time, function(err) {
      if(err) 
        console.log(err);
      else 
        console.log("win");
    }); 
  }
  res.send("", 500);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
