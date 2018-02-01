var database = (function () {
    var citiesList = [];

    var getRequest = function (url) {
        var promise = new Promise(function (resolve, reject) {
            $.ajax({
                url: url,
                datatype: "application/json",
                success: resolve,
                error: reject
            });
        })
        return promise;
    }

    var _getAllCities = (function () {
        getRequest("cities.json").then(function (data) {
            $(data["values"]).each(function (index, elem) {
                citiesList.push(elem);
            });
        })
    })();

    var _flattenObject = function (ob) {
        var toReturn = {};

        for (var i in ob) {
            if (!ob.hasOwnProperty(i)) continue;

            if ((typeof ob[i]) == 'object') {
                var flatObject = _flattenObject(ob[i]);
                for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue;

                    toReturn[x] = flatObject[x];
                }
            } else {
                toReturn[i] = ob[i];
            }
        }
        return toReturn;
    };



    var getWeatherInfo = function (place, unit, successCallback, failCallback) {
        var un = unit || "metric";
        var url = "";
        if (place.hasOwnProperty("city")) {
            console.log(place)
            var city = place.city;;
            url = "http://api.openweathermap.org/data/2.5/weather?q=" + city +
                "&appid=b566e35c1181791b83b9aefcbe9be910&units=" + un;
        } else if (place.hasOwnProperty("lat")) {
            var lat = place.lat;
            var lon = place.lon;
            url = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=b566e35c1181791b83b9aefcbe9be910&units=" + un;
            console.log(url);
        }

        getRequest(url).then(function (data) {
            data = _flattenObject(data);
            successCallback(data);
            console.log(data)

        });

        getRequest(url).catch(function () {
            console.log("FAILED")
            failCallback();

        });
    }

    var getWeatherInfoByLoc = function (unit, successCallback, failCallback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var locObj = {};
                locObj.lat = position.coords.latitude
                locObj.lon = position.coords.longitude;
                getWeatherInfo(locObj, unit, successCallback, failCallback);
            });
        } else {
            return "Geolocation is not supported by this browser.";
        }
    }

    var getFavorites = function () {
        if (localStorage.getItem("favorites")) {
            return JSON.parse(localStorage.getItem("favorites"))

        }
        return localStorage.setItem("favorites", JSON.stringify(["Varna", "Sofia", "Plovdiv", "Burgas", "Vidin"]));
    }

    return {
        citiesList,
        getWeatherInfo,
        getWeatherInfoByLoc,
        getFavorites,
    }
})();

var DOM = (function () {
    var currentCityName = $(".city-name").text();;

    var _changeIcon = function (name, time) {
        var defaultClass = "wi weather-icon";
        var _changeClass = function (newClass) {
            $("#icon").removeClass();
            $("#icon").addClass(defaultClass);
            $("#icon").addClass(newClass);
        }
        if (name === "Thunderstorm") {
            newClass = "wi-day-snow-thunderstorm"
        } else if (name === 'Clouds') {
            newClass = "wi-cloud"
        } else if (name === "Drizzle") {
            newClass = "wi-night-showers"
        } else if (name === "Rain") {
            newClass = "wi-rain"
        } else if (name === "Snow") {
            newClass = "wi-snowflake-cold"
        } else if (name === "Clear" && time === "d") {
            newClass = "wi-day-sunny"
        } else if (name === "Clear" && time === "n") {
            newClass = "wi-night-clear"
        } else if (name === "Extreme") {
            newClass = "wi-thunderstorm"
        } else if (name === "Mist" || name === "Fog" || name === "Haze") {
            newClass = "wi-fog"
        }

        _changeClass(newClass);

    }

    function _convertFromUnixTimeStamp(t) {
        var dt = new Date(t * 1000);
        var hr = dt.getHours();
        var m = "0" + dt.getMinutes();
        var s = "0" + dt.getSeconds();
        return hr + ':' + m.substr(-2) + ':' + s.substr(-2);
    }

    var displayData = function (obj) {
        $('.city-name').text(obj.name);
        $('.country-name').text(obj.country);
        $('.main-description').text(obj.main);
        $('.temp').text(Math.round(obj.temp));
        $('.description').text(obj.description);
        $('.temp_max').text(obj.temp_max);
        $('.temp_min').text(obj.temp_min);
        $('.sunrise').text(_convertFromUnixTimeStamp(obj.sunrise));
        $('.sunset').text(_convertFromUnixTimeStamp(obj.sunset));
        $('.speed').text(obj.speed);
        $('.clouds').text(obj.all);
        $('.pressure').text(obj.pressure);
        $('.humidity').text(obj.humidity);

        $('.lat').text(obj.lat);
        $('.lon').text(obj.lon);

        let iconName = obj.icon
        let time = iconName[iconName.length - 1];
        if (time === 'd') {
            $('.parallax').css('background-image', 'url("img/daysky.jpg")');
        } else {
            $('.parallax').css('background-image', 'url("img/nightsky.jpg")');
        }

        _changeIcon(obj.main, time) //changing the icon accordingly
        myMapChange()
    };

    var displayError = function (errorMessage) {
        $(".error-message-text").text(errorMessage); // Pop up error screen with the provided error text
        $(".wrapper").css("display", "block");

        $(".close-error").on("click", function () { // 'hide' the error message when click on 'X' button
            $(".wrapper").css("display", "none");
        });

        $(".error-message-container").on("click", function (e) { // Fire an event when you click outside the box to 'hide' the error message
            $(".wrapper").css("display", "none");
        });

        $(".error-message-screen").on("click", function (e) { // Stop the event from firing on the error message screen
            e.stopPropagation();
        });
    }


    return {
        displayData,
        displayError,
        currentCityName,
    }
})();

var favorites = (function () {
    var currentFavorites = database.getFavorites();
    var $ulFavorites = $("#ul-fav-cities");
    var $anchorList = $(".fav-citites-list");
    var elementTemplate = function (place) {
        var str = "<a class='fav-cities-list' href='#'><li>" + place + "</li><span class='cross'><i class='fa fa-times' aria-hidden='true'></i></span></a>"
        return str;
    }

    function _checkForExistingCity(city) {
        for (let i = 0; i < currentFavorites.length; i += 1) {
            if (currentFavorites[i] === city) {
                return true;
            }
        }
        return false;
    }

    var render = function (city) {
        var placeHolder = "";
        if (typeof currentFavorites === "string") {
            currentFavorites = JSON.parse(currentFavorites);
        }
        if (!city) {
            for (let i = 0; i < currentFavorites.length; i += 1) {
                placeHolder = elementTemplate(currentFavorites[i]);

                $ulFavorites.append(placeHolder);
            }
        } else {
            placeHolder = elementTemplate(city);
            $ulFavorites.append(placeHolder);
        }
    };

    function addCity() {
        var $cityName = $(".city-name").text();
        if (!_checkForExistingCity($cityName)) {
            render($cityName);
            currentFavorites.push($cityName);
            localStorage.setItem("favorites", JSON.stringify(currentFavorites));
        } else {
            DOM.displayError("City has already been added!")
        }
    }

    function deleteCity(event) {
        var $cityName = $(this).prev().text();
        $(this).parent().css("display", "none");

        for (let i = 0; i < currentFavorites.length; i += 1) {
            if (currentFavorites[i] === $cityName) {
                currentFavorites.splice(i, 1);
                break;
            }
        }

        localStorage.setItem("favorites", JSON.stringify(currentFavorites));
        event.stopPropagation();
    }
    return {
        addCity,
        deleteCity,
        render,
    }
})();


var app = (function () {
    var unit = "metric";
    var currentCity = "";

    var boot = function (unit) {
        update("London", unit)
        database.getWeatherInfoByLoc(unit, DOM.displayData, function () {});
        currentCity = DOM.currentCityName;
        favorites.render();
    }

    var update = function (cityName, unit) {
        let cityObj = {
            city: cityName
        };
        database.getWeatherInfo(cityObj, unit, DOM.displayData, function() {
            DOM.displayError("No results found. :(");
        });
        currentCity = cityName;
    };

    var bindEvents = function () {
        //search functionality
        $(".button").on('click', function (e) {
            var value = $(".search").val();
            e.preventDefault();
            if (value.length) {
                var value = $(".search").val();
                update(value, unit)
            } else {
                DOM.displayError("Please fill out the search field!")
            }
        });

        // autocomplete functionality to the search bar
        $(".search").autocomplete({
            source: function (request, response) {
                var matches = $.map(database.citiesList, function (acItem) {
                    if (acItem.toUpperCase().indexOf(request.term.toUpperCase()) ===
                        0) {
                        return acItem;
                    }
                });
                response(matches);
            },
            select: function (event, ui) {
                update(ui.item.value, unit);
            }
        });

        //toggle between measurement unit C/F
        $('#toggle').change(function () {
            if ($(this).prop('checked')) {
                setUnit("metric")
            } else {
                setUnit("imperial")
            }
            update(currentCity, unit, false);
        });

        //add favorite city
        $("#add-city").on("click", favorites.addCity);

        //delete favorite city
        $(document).on("click", ".cross", favorites.deleteCity);

        //update page when clicking on a city from the list
        $(document).on("click", ".fav-cities-list", function (e) {
            var cityToDisplay = $(this).children("li").text();
            update(cityToDisplay, unit);
        });


    }

    var setUnit = function (newUnit) {
        unit = newUnit;
    }

    var init = function () {
        bindEvents();
        boot();
    }

    return {
        init,
        setUnit,
    }
})();

$(document).ready(function () {
    app.init();
});

// Implementing add and delete favorite city functionality