$(window).resize(function() {
        //$("tbody").css("font-size","20px");
    var size=parseInt($("tbody").css("font-size").substr(0,$("tbody").css("font-size").length-2));
    while($(document).height()>$(window).height()) {
        size=parseInt($("tbody").css("font-size").substr(0,$("tbody").css("font-size").length-2));
        console.log(size);
        console.log($(document).height());
        console.log($(window).height());
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
$(document).ready(function() {
    $(window).resize();
});
setTimeout('Redirect()',refresh);
setInterval('count()',1000);
var flipflop=false;

function Redirect()
{
  location.reload(true);
}
function count() {
    var cur = new Date();
    var diff = (dest - cur) / 1000;
    if(diff<0) {
        $("#countdown").text("Countdown: Complete");
        return;
    }

    var hours = Math.floor(diff / 3600);
    var minutes = Math.floor((diff % 3600) / 60);
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
count();
