"use strict";
var global_wrap = document.getElementsByClassName("global_wrap")[0];

var weatherConditions = new XMLHttpRequest();
var weatherForecast = new XMLHttpRequest();
var hourlyForecast = new XMLHttpRequest();
var cObj;
var fObj;
var hObj;
var city = document.getElementById("city");
var state = document.getElementById("state");
var current_weather = document.getElementById("current_weather");
var current_temperature = document.getElementById("current_temperature");
var current_weather_icon = document.getElementById("current_weather_icon");

var startPoint;
var redoCurrentTime;

var loader = document.getElementsByClassName("loader")[0];
var loadCheck = "";

var today_month = document.getElementById("today_month");
var zip_button = document.getElementById("zip_button");
var zip_input = document.getElementById("zip_input");


zip_button.addEventListener("click", loadWeather);


function loadWeather(firstUseZip) {
    var zip = zip_input.value;

    if (!zip) {
        zip = firstUseZip
    }

    if (zip.length === 5 && !isNaN(zip)) {
        var current_condition_path = "http://api.wunderground.com/api/238e926ce0161f62/conditions/q/" + zip + ".json";
        var weekly_forecast_path = "http://api.wunderground.com/api/238e926ce0161f62/forecast10day/q/" + zip + ".json";
        var hourly_forecast_path = "http://api.wunderground.com/api/238e926ce0161f62/hourly/q/" + zip + ".json";

        weatherConditions.open("GET", current_condition_path, true);
        weatherConditions.responseType = "text";
        weatherConditions.send(null);

        weatherForecast.open("GET", weekly_forecast_path, true);
        weatherForecast.responseType = "text";
        weatherForecast.send(null);

        hourlyForecast.open("GET", hourly_forecast_path, true);
        hourlyForecast.responseType = "text";
        hourlyForecast.send(null);
        var thisPotato;
    }
    else {
        console.log("nice try buddy");
    }
    zip_input.value = "";
}

weatherConditions.onload = function () {
    if (weatherConditions.status === 200) {
        cObj = JSON.parse(weatherConditions.responseText);
        console.log(cObj);
        city.textContent = cObj.current_observation.display_location.city;
        state.textContent = cObj.current_observation.display_location.state_name;



        imLoading("Y");
    }
}



weatherForecast.onload = function () {
    if (weatherForecast.status === 200) {
        fObj = JSON.parse(weatherForecast.responseText);
        console.log(fObj);

        var wk_forecast_day_text = document.getElementsByClassName("wk_forecast_day_text");
        var wk_forecast_day_date = document.getElementsByClassName("wk_forecast_day_date");
        var wk_forecast_temp_high = document.getElementsByClassName("wk_forecast_temp_high");
        var wk_forecast_temp_low = document.getElementsByClassName("wk_forecast_temp_low");
        var wk_forecast_icon = document.getElementsByClassName("weather_icon_wrap");
        var wk_forecast_condition = document.getElementsByClassName("wk_forecast_condition");

        for (var i = 0; i < 7; i++) {

                wk_forecast_day_text[i].textContent = fObj.forecast.simpleforecast.forecastday[i].date.weekday;
                wk_forecast_day_date[i].textContent = fObj.forecast.simpleforecast.forecastday[i].date.day;
                wk_forecast_temp_high[i].textContent = "High " + fObj.forecast.simpleforecast.forecastday[i].high.fahrenheit + "°f";
                wk_forecast_temp_low[i].textContent = "Low " + fObj.forecast.simpleforecast.forecastday[i].low.fahrenheit + "°f";
                wk_forecast_condition[i].textContent = fObj.forecast.simpleforecast.forecastday[i].conditions;
                iconSwapper(wk_forecast_icon[i].children[0], fObj.forecast.simpleforecast.forecastday[i].icon_url);

        }
        //for the clock
        today_month.textContent = fObj.forecast.simpleforecast.forecastday["0"].date.monthname;

        imLoading("Y");

    }
}

var myHourlyVariables = {
    icons: "hourly_icon_",
    temperatures: "hourly_temp_"
}

for (var i = 0; i < 9; i++) {
    window[myHourlyVariables.icons + i] = document.getElementById(myHourlyVariables.icons + i);
    window[myHourlyVariables.temperatures + i] = document.getElementById(myHourlyVariables.temperatures + i);
}

hourlyForecast.onload = function () {
    if (hourlyForecast.status === 200) {
        hObj = JSON.parse(hourlyForecast.responseText);
        console.log(hObj);

        iconSwapper(current_weather_icon, hObj.hourly_forecast["0"].icon_url);
        today_month.textContent = hObj.hourly_forecast["0"].FCTTIME.month_name;
        current_weather.textContent = hObj.hourly_forecast["0"].condition;
        current_temperature.textContent = hObj.hourly_forecast["0"].temp.english; //using for current condition, more accurate

        for (var i = 0; i < 9; i++) {
            iconSwapper(window["hourly_icon_" + i], hObj.hourly_forecast[i * 3].icon_url);
            window["hourly_temp_" + i].textContent = hObj.hourly_forecast[i * 3].temp.english + "°";
        }

        function dayNightPosition() {

            var positionArray = ["30px", "45px", "45px", "30px", "15px", "0", "0", "15px", "30px", "45px", "45px", "30px", "15px", "0", "0", "15px", "30px"];
            var dayOrNight;
            var positionString = "";
            for (var i = 0; i < 4; i++) {
                if (Number(hObj.hourly_forecast[(i * 3)].FCTTIME.hour) >= 8 && Number(hObj.hourly_forecast[(i * 3)].FCTTIME.hour) <= 19) {
                    dayOrNight = "D";
                }
                else {
                    dayOrNight = "N";
                }
                positionString += dayOrNight;
            }

            var num = { NNNN: 0, NNND: 1, NNDD: 2, NDDD: 3, DDDD: 4, DDDN: 5, DDNN: 6, DNNN: 7 }[positionString];

            if (window.matchMedia("(min-width: 1024px)").matches) {

                for (var i = 0 + num; i < 9 + num; i++) {

                    window["hourly_icon_" + (i - num)].style.top = positionArray[i];
                }

                console.log("horizontal version");
            } else {

                for (var i = 0 + num; i < 9 + num; i++) {

                    window["hourly_icon_" + (i - num)].style.top = "0";
                }

                console.log("vertical version");
            }
            document.getElementsByTagName("body")[0].onresize = function () {
                dayNightPosition();
            }

        }
        dayNightPosition();

        imLoading("Y");
    }

}

var pHours = document.getElementById("hours"),
    pMinutes = document.getElementById("minutes"),
    pSeconds = document.getElementById("seconds"),
    pampm = document.getElementById("ampm"),
    ampm;

var changeHour = true;
var changeMinute = true;
var update_date = function () {
    var date = new Date(),
        hours = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds(),
        day = date.getDay();

    if (seconds === 0) {
        changeMinute = true;
    }

    if (minutes === 0 && seconds === 0) {
        changeHour = true;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    if (changeMinute === true) {
        pMinutes.textContent = minutes;
        changeMinute = false;
        console.log("minute change");
    }
    if (changeHour === true) {
        ampmChange();
        changeHour = false;
        console.log("hour change");
    }


    function ampmChange() {
        console.log("ran ampmChange");
        if (hours >= 12) {
            hours -= 12;
            ampm = "PM";
        } else {
            ampm = "AM";
        }

        if (hours === 0) {
            hours = 12;
        }
        pampm.textContent = ampm;
        pHours.textContent = hours;

    }

    pSeconds.textContent = seconds;
}
update_date();
setInterval(update_date, 1000);
//sprite positions
var icons = {
    day_partlycloudy: "-25% 40%",
    nt_partlycloudy: "0 -20%",
    day_mostlycloudy: "75% 40%",
    nt_mostlycloudy: "75% -20%",
    day_clear: "0 40%",
    nt_clear: "-25% -40%",
    day_chancetstorms: "-75% -60%",
    nt_chancetstorms: "25% 20%",
    day_tstorms: "-6px -40%",
    nt_tstorms: "50% 20%",
    cloudy: "25% 60%",
    nt_cloudy: "50% -20%",
    chancerain: "0 60%",
    nt_chancerain: "100% 0",
    rain: "75% 60%",
    nt_rain: "0 20%"
}
//sets the icons (when called upon)
function iconSwapper(element, feed) {
    //console.log(feed); check which is wrong
    switch(feed) {
        case "http://icons.wxug.com/i/c/k/partlycloudy.gif":
            element.style.backgroundPosition = icons.day_partlycloudy;
            break;
        case "http://icons.wxug.com/i/c/k/nt_partlycloudy.gif":
            element.style.backgroundPosition = icons.nt_partlycloudy;
            break;
        case "http://icons.wxug.com/i/c/k/mostlycloudy.gif":
            element.style.backgroundPosition = icons.day_mostlycloudy;
            break;
        case "http://icons.wxug.com/i/c/k/nt_mostlycloudy.gif":
            element.style.backgroundPosition = icons.nt_mostlycloudy;
            break;
        case "http://icons.wxug.com/i/c/k/clear.gif":
            element.style.backgroundPosition = icons.day_clear;
            break;
        case "http://icons.wxug.com/i/c/k/nt_clear.gif":
            element.style.backgroundPosition = icons.nt_clear;
            break;
        case "http://icons.wxug.com/i/c/k/chancetstorms.gif":
            element.style.backgroundPosition = icons.day_chancetstorms;
            break;
        case "http://icons.wxug.com/i/c/k/nt_chancetstorms.gif":
            element.style.backgroundPosition = icons.nt_chancetstorms;
            break;
        case "http://icons.wxug.com/i/c/k/tstorms.gif":
            element.style.backgroundPosition = icons.day_tstorms;
            break;
        case "http://icons.wxug.com/i/c/k/nt_tstorms.gif":
            element.style.backgroundPosition = icons.nt_tstorms;
            break;
        case "http://icons.wxug.com/i/c/k/cloudy.gif":
            element.style.backgroundPosition = icons.cloudy;
            break;
        case "http://icons.wxug.com/i/c/k/nt_cloudy.gif":
            element.style.backgroundPosition = icons.nt_cloudy;
            break;
        case "http://icons.wxug.com/i/c/k/chancerain.gif":
            element.style.backgroundPosition = icons.chancerain;
            break;
        case "http://icons.wxug.com/i/c/k/nt_chancerain.gif":
            element.style.backgroundPosition = icons.nt_chancerain;
            break;
        case "http://icons.wxug.com/i/c/k/rain.gif":
            element.style.backgroundPosition = icons.rain;
            break;
        case "http://icons.wxug.com/i/c/k/nt_rain.gif":
            element.style.backgroundPosition = icons.nt_rain;
            break;
        default:
            element.textContent = "CRAP! something's wrong with the feed";
            break;
    }
}


$(document).ready(function () {
    console.log("ready!");
});

loadWeather("76148");

//this would go in the onload function
// startPoint = cObj.current_observation.local_time_rfc822;
// redoCurrentTime = startPoint.substr(17, 8);
// console.log(redoCurrentTime);

// timeRedo();

// need a reliable time source
function timeRedo() {
    var timeArray = redoCurrentTime.split(":");
    console.log(redoCurrentTime);
    var redoHours = Number(timeArray[0]);
    var redoMinutes = Number(timeArray[1]);
    var redoSeconds = Number(timeArray[3]);
}

function imLoading(didILoad) {
    loadCheck += didILoad;
    if (loadCheck === "YYY") {

        console.log("done Loading");
        setTimeout(function () {
            loader.style.opacity = "0";
            setTimeout(function () {
                loader.style.display = "none";
            }, 400);
        }, 150);
    }
    else {
        console.log("still Loading");
    }
}
