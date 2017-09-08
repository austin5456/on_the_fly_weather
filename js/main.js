"use strict";
var myUl = document.getElementById("unrd");
var myDiv = document.getElementById("texthere");
var myPic = document.getElementById("pic");
var weekend = document.getElementById("weekend");
var weekday = document.getElementById("weekday");
var details = document.getElementById("details");
var hotelInfo;

for (var i = 0; i < myUl.children.length; i++) {
    myUl.children[i].addEventListener("click", myFunc);
}

document.getElementById("message").innerHTML = "whatever";

var xhr = new XMLHttpRequest();
xhr.open("GET", "./js/data.json", true);
xhr.responseType = "text";
/*
xhr.onreadystatechange = function () {
    console.log(xhr.readyState);
    console.log(xhr.status);
    console.log(xhr.statusText);
}
*/
xhr.onload = function () {
    if (xhr.status === 200) {
        hotelInfo = JSON.parse(xhr.responseText);
        console.log(hotelInfo);
        myFunc(true);
    }
}

function myFunc(flag) {
    if (flag === true) {
        var x = 0;
    } else {
        var x = this.getAttribute("rel");
    }
    myDiv.innerHTML = hotelInfo[x].name;
    myPic.src = hotelInfo[x].photo;
    weekend.innerHTML = hotelInfo[x].cost.weekend;
    weekday.innerHTML = hotelInfo[x].cost.weekday;
    console.log(hotelInfo[x].details);
    var myString = "";
    for (var i = 0; i < hotelInfo[x].details.length; i++) {
        myString += hotelInfo[x].details[i] + "<br>";
    }
    details.innerHTML = myString;
}

console.log("working")
xhr.send();
