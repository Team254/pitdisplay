//webhook key: Ah(jf-s9+8-093oled[prftoyg0le=;lkuh08GH9HYff56%0etgjs0U*&^(80pio90s
/*TODO 
 - Webhook Match Score... Does not report correctly. please figure out the problem
 - Webhook Delete Vidur's so no double request
 - GET / Renders index page
 - Verify webhook with checksum
 
Ryan's Stuff
 - Allow for the entry of a team number to filter the list
 - Stylize the thing to make it look usable
 - Countdown to next match
*/

/*NOTES/PROGRESS MADE
 - Match List Done (No notifications)
*/

//Date Plugin
Date.prototype.format=function(e){var t="";var n=Date.replaceChars;for(var r=0;r<e.length;r++){var i=e.charAt(r);if(r-1>=0&&e.charAt(r-1)=="\\"){t+=i}else if(n[i]){t+=n[i].call(this)}else if(i!="\\"){t+=i}}return t};Date.replaceChars={shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],longMonths:["January","February","March","April","May","June","July","August","September","October","November","December"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],longDays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],d:function(){return(this.getDate()<10?"0":"")+this.getDate()},D:function(){return Date.replaceChars.shortDays[this.getDay()]},j:function(){return this.getDate()},l:function(){return Date.replaceChars.longDays[this.getDay()]},N:function(){return this.getDay()+1},S:function(){return this.getDate()%10==1&&this.getDate()!=11?"st":this.getDate()%10==2&&this.getDate()!=12?"nd":this.getDate()%10==3&&this.getDate()!=13?"rd":"th"},w:function(){return this.getDay()},z:function(){var e=new Date(this.getFullYear(),0,1);return Math.ceil((this-e)/864e5)},W:function(){var e=new Date(this.getFullYear(),0,1);return Math.ceil(((this-e)/864e5+e.getDay()+1)/7)},F:function(){return Date.replaceChars.longMonths[this.getMonth()]},m:function(){return(this.getMonth()<9?"0":"")+(this.getMonth()+1)},M:function(){return Date.replaceChars.shortMonths[this.getMonth()]},n:function(){return this.getMonth()+1},t:function(){var e=new Date;return(new Date(e.getFullYear(),e.getMonth(),0)).getDate()},L:function(){var e=this.getFullYear();return e%400==0||e%100!=0&&e%4==0},o:function(){var e=new Date(this.valueOf());e.setDate(e.getDate()-(this.getDay()+6)%7+3);return e.getFullYear()},Y:function(){return this.getFullYear()},y:function(){return(""+this.getFullYear()).substr(2)},a:function(){return this.getHours()<12?"am":"pm"},A:function(){return this.getHours()<12?"AM":"PM"},B:function(){return Math.floor(((this.getUTCHours()+1)%24+this.getUTCMinutes()/60+this.getUTCSeconds()/3600)*1e3/24)},g:function(){return this.getHours()%12||12},G:function(){return this.getHours()},h:function(){return((this.getHours()%12||12)<10?"0":"")+(this.getHours()%12||12)},H:function(){return(this.getHours()<10?"0":"")+this.getHours()},i:function(){return(this.getMinutes()<10?"0":"")+this.getMinutes()},s:function(){return(this.getSeconds()<10?"0":"")+this.getSeconds()},u:function(){var e=this.getMilliseconds();return(e<10?"00":e<100?"0":"")+e},e:function(){return"Not Yet Supported"},I:function(){var e=null;for(var t=0;t<12;++t){var n=new Date(this.getFullYear(),t,1);var r=n.getTimezoneOffset();if(e===null)e=r;else if(r<e){e=r;break}else if(r>e)break}return this.getTimezoneOffset()==e|0},O:function(){return(-this.getTimezoneOffset()<0?"-":"+")+(Math.abs(this.getTimezoneOffset()/60)<10?"0":"")+Math.abs(this.getTimezoneOffset()/60)+"00"},P:function(){return(-this.getTimezoneOffset()<0?"-":"+")+(Math.abs(this.getTimezoneOffset()/60)<10?"0":"")+Math.abs(this.getTimezoneOffset()/60)+":00"},T:function(){var e=this.getMonth();this.setMonth(0);var t=this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/,"$1");this.setMonth(e);return t},Z:function(){return-this.getTimezoneOffset()*60},c:function(){return this.format("Y-m-d\\TH:i:sP")},r:function(){return this.toString()},U:function(){return this.getTime()/1e3}}


//Configuration
var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");
var http = require('http');
var request = require("request");
var fs = require('fs')

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); 
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://preview.c9.io');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true')
    next();
});
app.use(express.static(__dirname + '/client'));


//Todo: Make not useless


//WebHooks
app.post('/webHook', function (req,res) {
    console.log(req.body)
    try {
        var data = req.body;
    } catch (err) {
        console.log("error")
        fs.readFile('testData.json', function (err,datum) {
          if(err) {
              console.log(err)
          }
          //var data = datum 
          console.log(data)
        });
    }
    switch (data["message_type"]) {
        case "schedule_updated":
            //schedule was updated, reload it.
            scheduleUpdated(data["message_data"]["event_key"])
            console.log("schedule_updated")
            break;
        case "match_score":
            matchUpdated(data);
            console.log("match_score")
            break;
        default:
            console.log("unknown webhook:" + data["message_type"] + ". Ignoring.")
    }
});

//Blue Alliance API
//Schedule Request www.thebluealliance.com/api/v2/event/2014necmp/matches
var schedule = {};
var eventList = {};
var rankings = {};
var lag = {};
var heads = {
        "X-TBA-App-Id": "frc254:pitdisplay:v.01"   
    }
function scheduleUpdated(eventCode) {
    request({url: "http://www.thebluealliance.com/api/v2/event/" + eventCode + "/matches", headers: heads}, function(error, response, body) {
        schedule[eventCode] = body
        
        //send to appropriate room
        scheduleStream.to(eventCode).emit("schedule", body)
    });
}
function matchUpdated(data) {
    var teams = data.message_data.match.alliances;
    var time = data.message_data.match.time;
    //console.log(time);
    //Refresh Rankings on Match Score
    console.log("match scored : Scheduled Time: " + new Date(time * 1000).format("h:i a") + "| ACTUAL: " + new Date().format("h:i a"));
    var timeDelta = new Date().getTime() - (time * 1000) - 6*60*1000;
    lag[data.message_data.match.event_key] = timeDelta;
    console.log("DELTA: " + timeDelta);
    lagRoom.to(data.message_data.match.event_key).emit("lag", timeDelta)
    //console.log(teams);
    getRankings();
    getSchedule();
    for (team in teams.blue.teams) {
        if(teams.red.teams[team] == "frc254") {
            console.log("OMG")
        }
    }
    for (team in teams.red.teams) {
        if(teams.red.teams[team] == "frc254") {
            console.log("OMG")
        }
    }
}
function getEventList(){
    if (!(eventList.length > 0)){
        request({url: "http://www.thebluealliance.com/api/v2/events/2016", headers: heads}, function(error, response, body) {
            //create a smaller hash so that it uses less network
            eventList = {}
            for (var i = 0; i < JSON.parse(body).length; i++){
                var ev = JSON.parse(body)[i]
                eventList[ev["key"]] = ev["name"]
            }
            //send to appropriate room
            //console.log(eventList);
        });
    }
    return eventList
}
function updateRankings(event){
    request({url: "http://www.thebluealliance.com/api/v2/event/" + event + "/rankings", headers: heads}, function(error, response, body) {
        //create a smaller hash so that it uses less network
        rankings[event] = JSON.parse(body)
        rankingStream.to(event).emit("rankings", body)
    });
}
function getRankings(event){
    if (rankings[event] != null){
        return rankings[event]
    } else {
        updateRankings(event)
        return rankings[event]
    }
}


//Websockets
var scheduleStream = io.of("/schedule");
scheduleStream.on('connection', function(socket){
    scheduleStream.to(socket.id).emit("message", "joined schedule stream");
    var ev = getEventList();
    scheduleStream.to(socket.id).emit("eventList", JSON.stringify(ev))
    socket.on('setEvent', function(room){ 
        socket.join(room)
        refreshRoomList("/schedule");
        scheduleStream.to(socket.id).emit("message", "joined schedule stream room " + room)
        scheduleStream.to(socket.id).emit("schedule", schedule[room])
        scheduleUpdated(room)
    });
    socket.on('unsetEvent', function(room){ 
        socket.leave(room)
        refreshRoomList("/schedule");
    });
    socket.on('disconnect', function(){
        refreshRoomList("/schedule");
    });
});

var lagRoom = io.of("/lag");
lagRoom.on('connection', function(socket){
    lagRoom.to(socket.id).emit("message", "joined lag stream");
    socket.on('disconnect', function(){
        lagRoom.to(socket.id).emit("message", "bye");
    });
    socket.on('setEvent', function(room){ 
        socket.join(room)
        refreshRoomList("/lag");
        lagRoom.to(socket.id).emit("message", "joined lag stream room " + room)
        console.log("!!!!!!!!!!!!! LAG: "+ JSON.stringify(lag));
        lagRoom.to(socket.id).emit("lag", (lag[room] !== undefined && lag[room] !== null)? lag[room] : 0)
    });
    socket.on('unsetEvent', function(room){ 
        socket.leave(room)
        refreshRoomList("/lag");
    });
});


var rankingStream = io.of("/rankings");
rankingStream.on('connection', function(socket){
    rankingStream.to(socket.id).emit("message", "joined ranking stream");
    socket.on('disconnect', function(){
        refreshRoomList("/rankings");
    });
    socket.on('setEvent', function(room){ 
        socket.join(room)
        refreshRoomList("/rankings");
        rankingStream.to(socket.id).emit("message", "joined ranking stream room " + room)
        rankingStream.to(socket.id).emit("rankings", getRankings(room))
    });
    socket.on('unsetEvent', function(room){ 
        socket.leave(room)
        refreshRoomList("/rankings");
    });
});

var roomList = {}
function refreshRoomList(forNameSpace){
    var list = io.nsps[forNameSpace].adapter.rooms
    var filtered = []
    for (i in list){
        //Filter out users so it only shows rooms
        console.log(i)
        if (i.length < 15){
            filtered.push(i);
        }
    }
    roomList[forNameSpace] = filtered
}


server.listen(process.env.PORT);
console.log('Express server started on port %s', process.env.PORT);


//Cron Jobs
function getRankings(){
    for (room in roomList["/rankings"]){
        updateRankings(roomList["/rankings"][room])
    }
}

function getSchedule(){
    for (room in roomList["/schedule"]){
        scheduleUpdated(roomList["/schedule"][room])
    }
}
setInterval(getRankings, 120000); //Poll ranking every 2 mins

setInterval(getSchedule, 120000); //Poll ranking every 2 mins