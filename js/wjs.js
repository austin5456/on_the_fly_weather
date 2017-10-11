"use strict";
(function () {
var startPage = {
    init: function (firstZip) {
        masterHandler.init();
        zipHandler.init(firstZip);
        console.log(requestLog);
    }
}

var loadChecker = {
    items: {},
    init: function (numberOfItems) {
        this.itemsLoaded = 0;
        this.itemsToLoad = numberOfItems;
        this.cacheDom();
    },
    cacheDom: function(){
        this.myBody = document.getElementsByTagName("body")[0];
        this.loader_wrapper = document.getElementById("loader_wrapper");
    },
    iLoaded: function (itemName) {
        this.items[itemName] = clock.spitTime();
        //this.items.push(itemName);
        this.itemsLoaded += 1;
        this.doneLoading();
    },
    doneLoading: function () {
        var myScope = this;
        if (this.itemsLoaded === this.itemsToLoad) {
            this.dataDependantStyles();
            console.log("done Loading");
            setTimeout(function () {
                myScope.myBody.className = "loaded";
                setTimeout(function () {
                    myScope.loader_wrapper.style.display = "none";
                }, 1500);
            }, 150);
        }
    },
    dataDependantStyles: function () {
        stylesAfterLoad.init();
    }
}
loadChecker.init(3);

var stylesAfterLoad = {
    name: "stylesAfterLoad",
    init: function () {
        this.cacheDom();
        this.addDependency();
        this.onRezise();
        this.dayNightBG();
    },
    addDependency: function () {
        requestLog.addDependants(this.name, "hourlyForecast");
    },
    cacheDom: function () {
        this.globalWrap = document.getElementsByClassName("global_wrap")[0];
        this.sunMoon = document.getElementById("sun_moon");
    },
    onRezise: function () {
        document.getElementsByTagName("body")[0].onresize = function () {
            hourlyForecastM.mQueryPositions();
        };
    },
    dayNightBG: function () {
        var sunMoon = document.getElementById("sun_moon");
        if (hourlyForecastM.positionString.charAt(0) === "N") {
            this.globalWrap.className = "global_wrap night_sky";
            this.sunMoon.className = "moon";
        }
    }
}

var requestLog = {
    dependants: {},
    requestsMade: [],
    addDependants: function (dependant, dependantOn) {
        this.dependants[dependant] = dependantOn;
    },
    addReqMade: function (req) {
        this.requestsMade.push(req);
    }
};


var zipHandler = {
    name: "zipHandler",
    init: function (zip) {
        this.cacheDom();
        this.addEvents();
        this.loadNewLocation(zip)

    },
    cacheDom: function () {
        this.zipButton = document.getElementById("zip_button");
        this.zipInput = document.getElementById("zip_input");
    },
    addEvents: function () {
        var myScope = this;
        this.zipButton.addEventListener("click", this.checkZip.bind(this));
        this.zipInput.addEventListener("keypress", this.checkZip.bind(this));
        this.zipInput.addEventListener("focus", this.placeholderManager.bind(this));
        this.zipInput.addEventListener("blur", this.placeholderManager.bind(this));
    },
    checkZip: function (e) {
        if (e.charCode === 13 || e.type === "click") {
            if (this.zipInput.value.length === 5 && !isNaN(this.zipInput.value)) {
                this.extractValue();
            }
        }
    },
    extractValue: function () {
        this.zip = this.zipInput.value;
        this.zipInput.value = "";
        this.placeholderManager("");
        this.loadNewLocation(this.zip);
    },
    placeholderManager: function (e) {
        var currentZip = (this.zip) ? this.zip : "76148";
        var myPlaceholder = (e.type === "focus") ? "" : currentZip;
        this.zipInput.setAttribute("placeholder", myPlaceholder);
    },
    initialPageRender: function(){
    },
    loadNewLocation: function (zip) {
        masterHandler.handleData(zip);
    },
}


var masterHandler = {
    name: "masterHandler",
    init: function (userZip) {
        this.startModules();
    },
    handleData: function(userZip){
        this.pullData(userZip);
        this.loadAndInit();
    },
    startModules: function () {
        locationM.init();
        hourlyForecastM.init();
        currentConditionsM.init();
        weeklyForecastM.init();
    },
    pullData: function (userZip) {
        this.weatherConditions = new XMLHttpRequest();
        this.weatherForecast = new XMLHttpRequest();
        this.hourlyForecast = new XMLHttpRequest();
        var zip = userZip;

        var current_condition_path = "http://api.wunderground.com/api/238e926ce0161f62/conditions/q/" + zip + ".json";
        var weekly_forecast_path = "http://api.wunderground.com/api/238e926ce0161f62/forecast10day/q/" + zip + ".json";
        var hourly_forecast_path = "http://api.wunderground.com/api/238e926ce0161f62/hourly/q/" + zip + ".json";

        this.weatherConditions.open("GET", current_condition_path, true);
        this.weatherConditions.responseType = "text";
        this.weatherConditions.send(null);

        this.weatherForecast.open("GET", weekly_forecast_path, true);
        this.weatherForecast.responseType = "text";
        this.weatherForecast.send(null);

        this.hourlyForecast.open("GET", hourly_forecast_path, true);
        this.hourlyForecast.responseType = "text";
        this.hourlyForecast.send(null);
    },
    loadAndInit: function () {
        var myScope = this;
        this.weatherConditions.onload = function () {
            if (this.status === 200) {
                var reqName = "currentConditions";
                myScope.cObj = JSON.parse(this.responseText);
                console.log(myScope.cObj);
                locationM.render(myScope.cObj);
                loadChecker.iLoaded(reqName);
                requestLog.addReqMade(reqName);
            }
        }
        this.hourlyForecast.onload = function () {
            if (this.status === 200) {
                var reqName = "hourlyForecast";
                myScope.hObj = JSON.parse(this.responseText);
                console.log(myScope.hObj);
                hourlyForecastM.render(myScope.hObj);
                currentConditionsM.render(myScope.hObj);
                loadChecker.iLoaded(reqName);
                requestLog.addReqMade(reqName);
            }
        }
        this.weatherForecast.onload = function () {
            if (this.status === 200) {
                var reqName = "weeklyForecast";
                myScope.fObj = JSON.parse(this.responseText);
                console.log(myScope.fObj);
                weeklyForecastM.render(myScope.fObj);
                loadChecker.iLoaded(reqName);
                requestLog.addReqMade(reqName);
            }
        }
    }
}
var locationM = {
    name: "locationM",
    init: function (data) {
        this.cacheDom();
        this.addDependency();
    },
    addDependency: function() {
        requestLog.addDependants(this.name, "currentConditions");
    },
    render: function (data) {
        this.getData(data);
        this.setValues();
    },
    cacheDom: function () {
        this.city = document.getElementById("city");
        this.state = document.getElementById("state");
    },
    getData: function (data) {
        this.cObj = data;
    },
    setValues: function () {
        this.city.textContent = this.cObj.current_observation.display_location.city;
        this.state.textContent = this.cObj.current_observation.display_location.state_name;
    }
}
var currentConditionsM = {
    name: "currentConditionsM",
    init: function (data) {
        this.cacheDom();
        this.addDependency();
    },
    addDependency: function () {
        requestLog.addDependants(this.name, "hourlyForecast");
    },
    render: function(data) {
        this.getData(data);
        this.setValues();
    },
    cacheDom: function () {
        this.monthEle = document.getElementById("today_month");
        this.currentWeatherEle = document.getElementById("current_weather");
        this.currentTempEle = document.getElementById("current_temperature");
        this.curWeatherIconEle = document.getElementById("current_weather_icon");
    },
    getData: function (data) {
        //uses hourly data, it's more accurate
        this.hObj = data;
    },
    setValues: function () {
        iconSwapper(this.curWeatherIconEle, this.hObj.hourly_forecast["0"].icon_url);
        this.monthEle.textContent = this.hObj.hourly_forecast["0"].FCTTIME.month_name;
        this.currentWeatherEle.textContent = this.hObj.hourly_forecast["0"].condition;
        this.currentTempEle.textContent = this.hObj.hourly_forecast["0"].temp.english;
    }
}

var hourlyForecastM = {
    name: "hourlyForecastM",
    init: function (data) {
        this.cacheDom();
        this.addDependency();
    },
    addDependency: function () {
        requestLog.addDependants(this.name, "hourlyForecast");
    },
    render: function (data) {
        this.getData(data);
        this.setValues();
        this.dayVsNight();
        this.mQueryPositions();
    },
    cacheDom: function () {
        this.icons = document.getElementsByClassName("weather_icon_small");
        this.temps = document.getElementsByClassName("hourly_temp_holder");
    },
    getData: function (data) {
        this.hObj = data;
    },
    setValues: function () {
        for (var i = 0; i < 9; i++) {
            iconSwapper(hourlyForecastM.icons[i], this.hObj.hourly_forecast[i * 3].icon_url);
            this.temps[i].textContent = this.hObj.hourly_forecast[i * 3].temp.english + "°";
        }
    },
    dayVsNight: function () {
        this.positionArray = ["30px", "45px", "45px", "30px", "15px", "0", "0", "15px", "30px", "45px", "45px", "30px", "15px", "0", "0", "15px", "30px"];
        var dayOrNight;
        this.positionString = "";
        for (var i = 0; i < 4; i++) {
            // if in day hours
            dayOrNight = (Number(this.hObj.hourly_forecast[(i * 3)].FCTTIME.hour >= 8 && Number(this.hObj.hourly_forecast[(i * 3)].FCTTIME.hour) <= 19) ? "D" : "N");
            this.positionString += dayOrNight;
        }
        this.arrayLocation = {
            NNNN: 0,
            NNND: 1,
            NNDD: 2,
            NDDD: 3,
            DDDD: 4,
            DDDN: 5,
            DDNN: 6,
            DNNN: 7
        }[this.positionString];
    },
    mQueryPositions: function () {
        if (window.matchMedia("(min-width: 1000px)").matches) {
            for (var i = 0 + this.arrayLocation; i < 9 + this.arrayLocation; i++) {
                this.icons[(i - this.arrayLocation)].style.top = this.positionArray[i];
            }
            console.log("horizontal version");
        } else {
            for (var i = 0 + this.arrayLocation; i < 9 + this.arrayLocation; i++) {
                this.icons[(i - this.arrayLocation)].style.top = "0";
            }
            console.log("vertical version");
        }
    }
};


var weeklyForecastM = {
    name: "weeklyForecastM",
    init: function (data) {
        this.cacheDom();
        this.addDependency();
    },
    addDependency: function () {
        requestLog.addDependants(this.name, "weeklyForecast");
    },
    render: function (data) {
        this.getData(data);
        this.setValues();
    },
    cacheDom: function () {
        this.wk_forecast_day_text = document.getElementsByClassName("wk_forecast_day_text");
        this.wk_forecast_day_date = document.getElementsByClassName("wk_forecast_day_date");
        this.wk_forecast_temp_high = document.getElementsByClassName("wk_forecast_temp_high");
        this.wk_forecast_temp_low = document.getElementsByClassName("wk_forecast_temp_low");
        this.wk_forecast_icon = document.getElementsByClassName("weather_icon_wrap");
        this.wk_forecast_condition = document.getElementsByClassName("wk_forecast_condition");
    },
    getData: function (data) {
            this.fObj = data;
    },
    setValues: function () {
        for (var i = 0; i < 7; i++) {
            this.wk_forecast_day_text[i].textContent = this.fObj.forecast.simpleforecast.forecastday[i].date.weekday_short;
            this.wk_forecast_day_date[i].textContent = this.fObj.forecast.simpleforecast.forecastday[i].date.day;
            this.wk_forecast_temp_high[i].textContent = "High " + this.fObj.forecast.simpleforecast.forecastday[i].high.fahrenheit + "°f";
            this.wk_forecast_temp_low[i].textContent = "Low " + this.fObj.forecast.simpleforecast.forecastday[i].low.fahrenheit + "°f";
            iconSwapper(this.wk_forecast_icon[i].children[0], this.fObj.forecast.simpleforecast.forecastday[i].icon_url);
            this.wk_forecast_condition[i].textContent = this.fObj.forecast.simpleforecast.forecastday[i].conditions;
        }
    }
};

//var startClock = (function () {
var clock = {
    init: function () {
        this.cacheDom();
        this.domRenderInitial();
        this.clockGears.startInterval();
    },
    cacheDom: function () {
        this.pHours = document.getElementById("hours");
        this.pMinutes = document.getElementById("minutes");
        this.pSeconds = document.getElementById("seconds");
        this.pAmpm = document.getElementById("ampm");
    },
    domRenderInitial: function () {
        this.clockGears.extractTime();
        this.clockGears.renderTick(this.pSeconds, this.clockGears.seconds);
        this.clockGears.renderTick(this.pMinutes, this.clockGears.minutes);
        this.clockGears.renderTick(this.pHours, this.clockGears.hours);
        this.pAmpm.textContent = this.clockGears.ampm;
    },
    spitTime: function () {
        var secondString = this.clockGears.seconds.toString();
        var minuteString = this.clockGears.minutes.toString();
        var hourString = this.clockGears.hours.toString();
        var amPm = this.clockGears.ampm;
        var timeString = hourString + ":" + minuteString + ":" + secondString + " " + amPm;
        return timeString;
    },
    clockGears: {
        startInterval: function () {
            var myScope = this;
            setInterval(function () {
                myScope.updateSeconds();
            }, 1000);
        },
        extractTime: function () {
            this.date = new Date();
            this.seconds = this.date.getSeconds();
            this.minutes = this.date.getMinutes();
            this.hours = this.date.getHours();
            this.ampm = (this.hours >= 12) ? "PM" : "AM";
        },
        updateSeconds: function () {
            this.seconds += 1;
            if (this.seconds === 60) {
                this.seconds = 0;
                this.updateMinutes();
            }
            this.renderTick(clock.pSeconds, this.seconds);
        },
        updateMinutes: function () {
            this.minutes += 1;
            if (this.minutes === 60) {
                this.minutes = 0;
                this.updateHours()
            }
            this.renderTick(clock.pMinutes, this.minutes);
        },
        updateHours: function () {
            this.hours += 1;
            this.hours = (this.hours === 24) ? 0 : this.hours;
            if (this.hours >= 12) {
                this.hours -= 12;
                this.ampm = "PM"
            }
            else {
                this.ampm = "AM";
            }
            this.renderTick(clock.pAmpm, this.ampm);
            this.renderTick(clock.pHours, this.hours);
        },
        renderTick: function (element, value) {
            if (element === clock.pSeconds || element === clock.pMinutes) {
                value = (value <= 9) ? ("0" + value) : value;
            }
            if (element === clock.pHours) {
                value = (value >= 12 ? (value - 12) : value);
                value = (value === 0) ? 12 : value;
            }
            element.textContent = value;
        }
    }
}
clock.init();
//}())


//sprite positions
var icons = {
    day_partlycloudy: "-28% 39%",
    nt_partlycloudy: "-3% -20%",
    day_mostlycloudy: "73% 40%",
    nt_mostlycloudy: "72% -20%",
    day_clear: "0 40%",
    nt_clear: "-25% -40%",
    day_chancetstorms: "-78% -60%",
    nt_chancetstorms: "22% 20%",
    day_tstorms: "-3% -40%",
    nt_tstorms: "47% 20%",
    cloudy: "22% 59%",
    nt_cloudy: "47% -20%",
    chancerain: "-2% 60%",
    nt_chancerain: "97% 0",
    rain: "72.5% 60%",
    nt_rain: "-3% 20%",
    fog: "25% 40%",
    nt_fog: "25% -20%"
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
        case "http://icons.wxug.com/i/c/k/fog.gif":
            element.style.backgroundPosition = icons.fog;
            break;
        case "http://icons.wxug.com/i/c/k/nt_fog.gif":
            element.style.backgroundPosition = icons.nt_fog;
            break;
        default:
            element.textContent = "CRAP! something's wrong with the feed";
            break;
    }
}
startPage.init("76148");
})()