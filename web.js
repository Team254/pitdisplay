var express = require("express");
var colors = require('colors');
var http = require("http");
var cheerio = require("cheerio");
var fs = require("fs");
var currentcolor = "c,0,0,255,solid,1,1:"; var coloroveride = false; var lastcolor = "c,0,0,255,solid,1,1:"; var pattern="fade";
var SerialPort = require("serialport").SerialPort

var port = "";
process.argv.forEach(function (val, index, array) {
  if (index == 2){
    console.log('[info]'.blue +': Arduino on port: ' + val);
    port = val;
  }
});

try {
  var serialPort = new SerialPort(port, { //COM PORT HERE
    baudrate: 115200
  });
} catch (err){
      console.log("[FATAL]".red + ": THE ARDUINO DOES NOT WORK")
      console.log("         ---> ERROR: " + err + " PORT SPECIFIED: " + port);
}


var lastTime=0;
var app = express.createServer(); //express.logger()
app.set('views', __dirname + '/views')
app.set('view options', {
      layout: false
});
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/public'))
app.use(express.bodyParser());

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
                   //console.log("HELLA "+i);
                   data.push({rank: $(rowdata[0]).text(),
                             team: $(rowdata[1]).text(),
                             qs: $(rowdata[2]).text(),
                             assist: $(rowdata[3]).text(),
                             ap: $(rowdata[4]).text(),
                             tc: $(rowdata[5]).text(),
                             tp: $(rowdata[6]).text(),
                             record: $(rowdata[7]).text(),
                             dq: $(rowdata[8]).text(),
                             played: $(rowdata[9]).text()});
                 }
                 res.render('rank', {test: test, team: team, data: data, refresh: refresh});
             });
           }
  ).on('error', function(e) {
    console.log("Couldn't connect to FIRST");
    res.send("Couldn't connect to FIRST",500);
  });
});
app.get('/kill', function(req, res) {
  if (coloroveride){
    coloroveride = false;
    res.write("TURNED OFF COLOR OVERIDE. RELOAD TO TURN ON");
    displaycolor(lastcolor, true);
  } else {
    coloroveride = true;
    lastcolor = currentcolor;
    res.write("TURNED ON COLOR OVERIDE. RELOAD TO TURN OFF");
    displaycolor("c,0,0,255,solid,1,1:", true);
  }
  res.end();
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
                   //console.log(rowdata);
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

var options;
var color;
var pattern;
var fadetimes;

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.post('/lights', function(req, res){
  console.log("==============[Time: ".green + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + " Mode: " + req.body.options + ", " + req.body.pattern + "]=============".green );
  var isGameTimerOn = false;
  pattern = req.body.pattern;
  if(req.body.options && req.body.options != options) {
    options = req.body.options;
  }
  if(req.body.color && req.body.color != color) {
    color = req.body.color;
  }
  if(req.body.pattern && req.body.pattern != pattern) {
    pattern = req.body.pattern;
  }
  if(req.body.fadetimes && req.body.fadetimes != fadetimes) {
    fadetimes = req.body.fadetimes;
  }

  if(req.body.time && lastTime != req.body.time) {
    isGameTimerOn = true;
    lastTime = req.body.time;
    lastcolor = currentcolor;
    coloroverideoveride = false;
    if (coloroveride){
      //There was already an overide in place
      coloroverideoveride = true;
    } else {
      coloroverideoveride = false;
    }
    coloroveride = true;
    if (req.body.timecolor == "red"){
      displaycolor("c,255,0,0,flash,1,1:", (lastcolor.substring(0,1) != "c" || pattern == "fade"));
    } else {
      displaycolor("c,0,0,255,flash,1,1:", (lastcolor.substring(0,1) != "c" || pattern == "fade"));
    }
    console.log("[info]".blue +": GOT A TIME REQUEST".green);
    setTimeout(function(){if (!coloroverideoveride){coloroveride = false}; displaycolor(lastcolor)}, (lastTime * 1000));
  } else {
    isGameTimerOn = false;
  }

  /*text = "gametimer=" + isGameTimerOn + "," + (req.body.team || "blue")
  + "," + (req.body.time || 0)
  + "\noptions=" + options+ "\n"
  + "color=" + color + "\n"
  + "pattern="+pattern+"\n"
  + "fadetime="+fadetimes+"";
  path = "/Users/ryanjohnson/Documents/Coding/pitbox/pit.txt";
  //path = "C:\\PitDisplayConfiguration\\PitDsiplayColorConfig.txt";
  fs.writeFile(path, text, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("win");
    }
  });*/
  if (!coloroveride){
    currentcolor = (options.substring(0,1) + "," + color + "," + pattern + "," + fadetimes + ":");
    if (lastcolor.substring(0,1) != "c" && currentcolor.substring(0,1) == "c"){
      displaycolor(options.substring(0,1) + "," + color + "," + pattern + "," + fadetimes + ":", true);
    } else {
      displaycolor(options.substring(0,1) + "," + color + "," + pattern + "," + fadetimes + ":");
    }
    lastcolor = currentcolor;
  }
  res.setHeader("Access-Control-Max-Age", "1728000");
  res.send("asdf", 200)
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("[info]".blue +"".blue+": Listening on " + port);
});
function displaycolor(colorstring, doubletime){
  try{
    if (doubletime){
      
      console.log("[info]".blue +": Doing a doubletime of " + 1000 + " ms. Just for dev purposes, doubletime = " + doubletime);
      doubletime = 1000;
      console.log("[info]".blue +": Sent to arduino: " + colorstring);
      currentcolor = colorstring;
      setTimeout(function(){
        try{
        console.log("[info]".blue +": Sent to arduino: " + colorstring);
        serialPort.open(function () {
          serialPort.write(colorstring, function(err, results) {
            console.log('[warn]'.warn +': Arduino Serial error in serialPort.write. Probably not fatal' + err);
            console.log('[info]'.blue +': Serial Results: ' + results);
          });
        });
        } catch(error){
          console.log("[FATAL]".red + ": SerialWrite Error: " + error);
        }
      }, 1000);
      serialPort.open(function () {
        serialPort.write(colorstring, function(err, results) {
          console.log('!!!!!err ' + err);
          console.log('results ' + results);
        });
      });
    } else {
      console.log("[info]".blue +": Sent to arduino: " + colorstring);
      serialPort.open(function () {
        serialPort.write(currentcolor, function(err, results) {
          console.log('[warn]'.warn +': Arduino Serial error in serialPort.write. Probably not fatal' + err);
          console.log('[info]'.blue +': Serial Results: ' + results);
        });
      });
    }
  } catch (error){
    console.log("[FATAL]".red + ": SerialWrite Error: " + error);
  }
  currentcolor = colorstring;
}
