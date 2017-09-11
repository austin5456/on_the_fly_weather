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
var timeZone;
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
    } else {
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
        timeZone = fObj.forecast.simpleforecast.forecastday["0"].date.tz_short;
        var wk_forecast_day_text = document.getElementsByClassName("wk_forecast_day_text");
        var wk_forecast_day_date = document.getElementsByClassName("wk_forecast_day_date");
        var wk_forecast_temp_high = document.getElementsByClassName("wk_forecast_temp_high");
        var wk_forecast_temp_low = document.getElementsByClassName("wk_forecast_temp_low");
        var wk_forecast_icon = document.getElementsByClassName("weather_icon_wrap");
        var wk_forecast_condition = document.getElementsByClassName("wk_forecast_condition");
        for (var i = 0; i < 7; i++) {
            wk_forecast_day_text[i].textContent = fObj.forecast.simpleforecast.forecastday[i].date.weekday_short;
            wk_forecast_day_date[i].textContent = fObj.forecast.simpleforecast.forecastday[i].date.day;
            wk_forecast_temp_high[i].textContent = "High " + fObj.forecast.simpleforecast.forecastday[i].high.fahrenheit + "°f";
            wk_forecast_temp_low[i].textContent = "Low " + fObj.forecast.simpleforecast.forecastday[i].low.fahrenheit + "°f";
            iconSwapper(wk_forecast_icon[i].children[0], fObj.forecast.simpleforecast.forecastday[i].icon_url);
            wk_forecast_condition[i].textContent = fObj.forecast.simpleforecast.forecastday[i].conditions;
        }
        //for the clock
        today_month.textContent = fObj.forecast.simpleforecast.forecastday["0"].date.monthname;
        imLoading("Y");
    }
}
hourlyForecast.onload = function () {
    if (hourlyForecast.status === 200) {
        hObj = JSON.parse(hourlyForecast.responseText);
        console.log(hObj);
        //using for current condition, more accurate
        iconSwapper(current_weather_icon, hObj.hourly_forecast["0"].icon_url);
        today_month.textContent = hObj.hourly_forecast["0"].FCTTIME.month_name;
        current_weather.textContent = hObj.hourly_forecast["0"].condition;
        current_temperature.textContent = hObj.hourly_forecast["0"].temp.english;
        //end current conditions
        var myHourlyVariables = {
            icons: "hourly_icon_",
            temperatures: "hourly_temp_"
        }
        for (var i = 0; i < 9; i++) {
            window[myHourlyVariables.icons + i] = document.getElementById(myHourlyVariables.icons + i);
            window[myHourlyVariables.temperatures + i] = document.getElementById(myHourlyVariables.temperatures + i);
        }
        for (var i = 0; i < 9; i++) {
            iconSwapper(window["hourly_icon_" + i], hObj.hourly_forecast[i * 3].icon_url);
            window["hourly_temp_" + i].textContent = hObj.hourly_forecast[i * 3].temp.english + "°";
        }

        function dayNightPosition() {
            var positionArray = ["30px", "45px", "45px", "30px", "15px", "0", "0", "15px", "30px", "45px", "45px", "30px", "15px", "0", "0", "15px", "30px"];
            var dayOrNight;
            var positionString = "";
            for (var i = 0; i < 4; i++) {
                // if in day hours
                if (Number(hObj.hourly_forecast[(i * 3)].FCTTIME.hour) >= 8 && Number(hObj.hourly_forecast[(i * 3)].FCTTIME.hour) <= 19) {
                    dayOrNight = "D";
                } else {
                    dayOrNight = "N";
                }
                positionString += dayOrNight;
            }
            var sun_moon = document.getElementById("sun_moon");
            if (positionString.charAt(0) === "N") {
                global_wrap.className = "global_wrap night_sky"
                sun_moon.className = "moon";
            }
            var num = {
                NNNN: 0,
                NNND: 1,
                NNDD: 2,
                NDDD: 3,
                DDDD: 4,
                DDDN: 5,
                DDNN: 6,
                DNNN: 7
            }[positionString];
            if (window.matchMedia("(min-width: 1000px)").matches) {
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

function setTime() {
    var date = new Date();
    updateSeconds(date.getSeconds());
    updateMinute(date.getMinutes());
    updateHour(date.getHours());
    var update_date = function () {
        date = new Date();
        var seconds = date.getSeconds();
        updateSeconds(seconds);
        if (seconds === 0) {
            var minutes = date.getMinutes();
            updateMinute(minutes);
        }
        if (minutes === 0 && seconds === 0) {
            var hours = date.getHours();
            updateHour(hours)
        }
    }

    function updateSeconds(seconds) {
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        pSeconds.textContent = seconds;
    }

    function updateMinute(minutes) {
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        pMinutes.textContent = minutes;
        console.log("minute change");
    }

    function updateHour(hours) {
        console.log("hour/ampm change");
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
    update_date();
    setInterval(update_date, 1000);
}
setTime();
//sprite positions
var icons = {
    day_partlycloudy: "-28% 39%",
    nt_partlycloudy: "-3% -20%",
    day_mostlycloudy: "73% 40%",
    nt_mostlycloudy: "72% -20%",
    day_clear: "0 40%",
    nt_clear: "-25% -40%",
    day_chancetstorms: "-77% -60%",
    nt_chancetstorms: "22% 20%",
    day_tstorms: "-3% -40%",
    nt_tstorms: "47% 20%",
    cloudy: "22% 59%",
    nt_cloudy: "47% -20%",
    chancerain: "-2% 60%",
    nt_chancerain: "97% 0",
    rain: "72.5% 59%",
    nt_rain: "-3% 20%"
}
//sets the icons (when called upon)
function iconSwapper(element, feed) {
    //console.log(feed); check which is wrong
    switch (feed) {
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

function imLoading(didILoad) {
    loadCheck += didILoad;
    var myBody = document.getElementsByTagName("body")[0];
    var loader_wrapper = document.getElementById("loader_wrapper");
    if (loadCheck === "YYY") {
        console.log("done Loading");
        setTimeout(function () {
            myBody.className = "loaded";
            setTimeout(function () {
                loader_wrapper.style.display = "none";
            }, 1500);
        }, 150);
    } else {
        console.log("still Loading");
    }
}