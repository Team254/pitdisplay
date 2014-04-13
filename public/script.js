var dest = new Date();
var hours;
var minutes;
var color = "blue";
var lastmins;

function Redirect()
{
  var request = $.ajax({url: location.href});
  request.done(function(response, textStatus, jqXHR) {
    $("body").html($(response));
  });
  request.fail(function(jqXHR, textStatus, errorThrown) {
    console.log(textStatus);
    console.log(errorThrown);
    alert("Error reloading page:\n"+errorThrown);
  });
}
function count() {
  var cur = new Date();
  var diff = (dest - cur) / 1000;
  if(diff<0) {
    $("#countdown").text("Countdown: Complete");
    return;
  }

  hours = Math.floor(diff / 3600);
  minutes = Math.floor((diff % 3600) / 60);
  var seconds = Math.floor(diff % 60);
  if(hours<10) {
    hours="0"+hours;
  }
  if(minutes<10) {
    minutes="0"+minutes;
  }
  if(seconds<10) {
    seconds="0"+seconds;
  }
  $("#countdown").text("Countdown: "+hours+":"+minutes+":"+seconds);
  if(diff <= 60) {
    if(flipflop) {
      $("#countdown").css("background-color","red");
    } else {
      $("#countdown").css("background-color","gold");
    }
    flipflop = !flipflop;
  } else if (diff <= 300) {
    $("#countdown").css("background-color","red");
  } else if (diff <= 600) {
    $("#countdown").css("background-color","gold");
  }
}
function gqv(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
}
function updateFile() {
  if (lastmins == null || lastmins == ""){
    lastmins = parseInt(minutes) + 1;
  }
  if(hours == 0 && minutes < 10 && minutes == (lastmins - 1)) {
    lastmins = parseInt(minutes);
    $.post("http://localhost:5000/lights", {"time" : (minutes + 1), "timecolor" : color});
    console.log({"time" : minutes, "timecolor" : color})
  }
}
function parseTime(timeString) {    
  if (timeString == '') return null;

  var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i); 
  if (time == null) return null;

  var hours = parseInt(time[1],10);    
  if (hours == 12 && !time[4]) {
    hours = 0;
  }
  else {
    hours += (hours < 12 && time[4])? 12 : 0;
  }   
  var d = new Date();             
  d.setHours(hours);
  d.setMinutes(parseInt(time[3],10) || 0);
  d.setSeconds(0, 0);  
  return d;
}
function aLink() {
  if(document.location.pathname === "/display") {
    link = "http://"+document.location.host+"/rank?team=" + gqv("team")
            + "&event="+gqv("event")
            + "&refresh=" + gqv("refresh")
            + "&elims=" + gqv("elims");
  } else {
    link = "http://"+document.location.host+"/display?team=" + gqv("team")
            + "&event="+gqv("event")
            + "&refresh=" + gqv("refresh")
            + "&elims=" + gqv("elims");
  }
  $("a").attr("href", link);
}
$(window).resize(function() {
  //$("tbody").css("font-size","20px");
  var size=parseInt($("tbody").css("font-size").substr(0,$("tbody").css("font-size").length-2));
  while($(document).height()>$(window).height() && size > 20) {
    size=parseInt($("tbody").css("font-size").substr(0,$("tbody").css("font-size").length-2));
    $("html").css("font-size",(size-1)+"px");
    $("tbody").css("font-size",(size-1)+"px");
    $("tbody").css("font-size",(size-1)+"px");
    $("tbody").css("font-size",(size-1)+"px");
    $(".maintable").css("border-spacing",(size-1)/4+"px");
    $(".match").css("padding",(size-1)/8*3+"px");
    $(".blue").css("padding",(size-1)/8*3+"px");
    $(".red").css("padding",(size-1)/8*3+"px");
    $(".outcome").css("padding",(size-1)/8*3+"px");
    $("#countdown").css("padding",(size-1)/8*3+"px");
  }
});

$(function() {
  $(window).resize();
  var latch = false;
  var tmpcolor = "blue";
  $("tr.matchRow").each(function(index){
    var d = parseTime($(this).find(".outcome").find(".time").text());
    //console.log(d);
      $(this).find("td").each(function(indext){
        if (indext == 2){
          if ($(this).parent().parent().parent().parent().attr("class") == "red myred"){
            //console.log("red");
            tmpcolor = "red";
          } else {
            tmpcolor = "blue";
            //console.log("blue");
            //console.log($(this).parent().parent().parent().parent().attr("class"));
          }
        } 
      });
    if (!latch && d > new Date()) {
      color = tmpcolor;
      dest = d;
      latch = true;
    }
  });
/*  $("div.time").each(function(i, val) {
    var d = parseTime($(val).text());
    if (!latch && d > new Date()) {
      dest = d;
      latch = true;
    }
  });*/
  aLink();
  setTimeout('Redirect()',refresh);
  setInterval('count()',1000);
  setInterval('updateFile()', 1000);
  var flipflop=false;
  count();
});

