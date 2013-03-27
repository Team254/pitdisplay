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
                 var display = "table class='mainTable'><tr class=matchRow><td class=match>Match</td><td class=red>Red Alliance</td><td class=blue>Blue Alliance</td><td class=outcome>Time / Result</td></tr>";
                 for(var i=0;i<data.length;i++) {
                   console.log(i);
                   var row = data[i];
                   var potential = [row.red1, row.red2, row.red3, row.blue1, row.blue2, row.blue3];
                   var spot = potential.indexOf(team);
                   if (spot > -1) {
                     var redness = spot < 3 ? "myred" : "";
                     var blueness = spot > 2 ? "myblue" : "";
                     display+="<tr class=matchRow><td class=match>"+row.match+"</td><td class='red "+redness+"'><table><tr>";
                     for(var j=0;j<3;j++) {
                       display+="<td class='oneTeam ";
                       if (spot == j) {
                         display += "myTeam";
                       }
                       display+="'>"+row["red"+(j+1)]+"</td>";
                     }
                     display+="</tr></table></td><td class='blue "+blueness+"'><table><tr>";
                     for(var j=0;j<3;j++) {
                       display+="<td class='oneTeam ";
                       if (spot == j+3) {
                         display += "myTeam";
                       }
                       display+="'>"+row["blue"+(j+1)]+"</td>";
                     }
                     display+="</tr></table></td><td class=outcome>";

                     var first = spot < 3 ? "myTeam" : "";
                     var second = spot > 2 ? "myTeam" : "";

                     if (row.redscore != "" && row.bluescore != "") {
                       var outcome = "";
                       if (row.redscore == row.bluescore) {
                         outcome = "T";
                       }
                       else if ((spot < 3 && parseInt(row.redscore) > parseInt(row.bluescore)) ||
                                (spot > 2 && parseInt(row.redscore) < parseInt(row.bluescore))) {
                         outcome = "W"
                       }
                       else {
                         outcome = "L";
                       }
                       display+="<table><tr><td class='oneTeam "+first+"'>"+row.redscore+"</td><td class='oneTeam "+second+"'>"+row.bluescore+"</td><td class=oneTeam>"+outcome+"</td></tr></table>";
                     }
                     else {
                       display += row.time;
                     }
                     display+= "</td></tr>";
                   }
                 }
                 display+="</table";
                 res.render('display', {disp: display});
             });
           }
  );
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
