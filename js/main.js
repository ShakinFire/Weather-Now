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
            failCallback();

        });
    }

    var getLocation = function (unit, successCallback, failCallback) {
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

    return {
        citiesList,
        getWeatherInfo,
        getLocation,
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
        } else if (name === "Mist" || name === "Fog") {
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

    var displayError = function () {
        // ts find");
    }


    return {
        displayData,
        displayError,
        currentCityName,
    }
})();



var app = (function () {
    var unit = "metric";
    var currentCity = "";

    var boot = function (unit) {
        update("London", unit)
        database.getLocation(unit, DOM.displayData, function () {});
        currentCity = DOM.currentCityName;
        console.log(DOM.cityName)
    }

    var update = function (cityName, unit) {
        let cityObj = {
            city: cityName
        };
        database.getWeatherInfo(cityObj, unit, DOM.displayData, DOM.displayError);
        currentCity = cityName;
    };

    var bindEvents = function () {
        $(".button").on('click', function (e) {
            e.preventDefault();
            var value = $(".search").val();
            update(value, unit)
        });

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

        $('#toggle').change(function () {
            if ($(this).prop('checked')) {
                setUnit("metric")
            } else {
                setUnit("imperial")
            }
            update(currentCity, unit, false);
        });
    }

    var setUnit = function (newUnit) {
        unit = newUnit;
    }

    var init = function () {
        bindEvents();
        boot();
        // update("Sofia", unit)

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

var errorScreen = function (errorText) {
    $(".error-message-text").text(errorText); // Pop up error screen with the provided error text
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



// $(function () {
//     var checkExistingName = function (cityToCheck) { // check the whole favorite list in local storage for same name
//         var initialFavorites = JSON.parse(localStorage.getItem("favorites"));
//         var isChecked = false;
//         initialFavorites.forEach((val) => {
//             if (cityToCheck === val) {
//                 isChecked = true;
//             }
//         });
//         return isChecked;
//     }

//     var generateFavoriteCities = function () { // Every refresh generate the local storage list of favorite cities
//         var initialFavorites = JSON.parse(localStorage.getItem("favorites"));
//         initialFavorites.forEach((val) => {
//             var placeHolder = `<a class='fav-cities-list' href='#'>
//             <li>` + val + `</li>
//             <span class='cross'>
//                 <i class='fa fa-times' aria-hidden='true'></i>
//             </span>
//             </a>`;
//             $("#ul-fav-cities").append(placeHolder);
//         });
//     }

//     if (localStorage.length === 0) { // checks if there is already modified local storage, if not, set the default cities
//         var holdDefault = ['Varna', 'Sofia', 'Vidin', 'Burgas'];
//         localStorage.setItem("favorites", JSON.stringify(holdDefault));
//         var initialFavorites = JSON.parse(localStorage.getItem("favorites"));
//     }
//     generateFavoriteCities();

//     var deleteItem = function (deletedCity) { // Deleting city from local storage
//         var initialFavorites = JSON.parse(localStorage.getItem("favorites"));
//         for (let i = 0; i < initialFavorites.length; i += 1) {
//             if (initialFavorites[i] === deletedCity) {
//                 initialFavorites.splice(i, 1);
//                 break;
//             }
//         }

//         localStorage.setItem("favorites", JSON.stringify(initialFavorites));
//     }

//     var addCity = function (addedCity) { // Add city in local storage
//         var currentFavorites = JSON.parse(localStorage.getItem("favorites"));
//         currentFavorites.push(addedCity);
//         localStorage.setItem("favorites", JSON.stringify(currentFavorites));
//         currentFavorites = JSON.parse(localStorage.getItem("favorites"));
//     }

//     $("#add-city").on("click", function () { // append the whole fragment for favorite city
//         var $cityName = $(".city-name").text();
//         if (checkExistingName($cityName)) {
//             errorScreen("This city is already in your favorite list!");
//         } else {
//             var placeHolder = `<a class='fav-cities-list' href='#'>
//             <li>` + $cityName + `</li>
//             <span class='cross'>
//                 <i class='fa fa-times' aria-hidden='true'></i>
//             </span>
//             </a>`;
//             $("#ul-fav-cities").append(placeHolder);
//             addCity($cityName);
//         }
//     });

//     $(document).on("click", ".cross", function (e) { // detach the whole fragment for favorite city
//         var name = $(this).prev().text();
//         $(this).parent().css("display", "none");
//         deleteItem(name);
//         e.stopPropagation();
//     });

//     $(document).on("click", ".fav-cities-list", function () { // When clicked on city in the favorite list, refresh the weather-info for this city
//         var a = $(this).children("li").text();
//         console.log(a); // TODO attach it to the module
//     });
// });

$(function() {
    var favorites = (function() {
        var currentFavorites = localStorage.getItem("favorites") ? 
        JSON.parse(localStorage.getItem("favorites")) :
        localStorage.setItem("favorites", JSON.stringify(["Varna", "Sofia", "Plovdiv", "Burgas", "Vidin"]));
        var $ulFavorites = $("#ul-fav-cities");
        render();
        var $anchorList = $(".fav-citites-list");
        var $add = $("#add-city");

        // bind events
        $(document).on("click", ".cross", deleteCity);
        $add.on("click", addCity);
        $(document).on("click", ".fav-cities-list", displayCity);

        function displayCity() {
            var cityToDisplay = $(this).children("li").text();
            console.log(cityToDisplay); // connect with the database module, to refresh the displayed city
        }

        function checkForExistingCity(city) {
            for (let i = 0; i < currentFavorites.length; i += 1) {
                if (currentFavorites[i] === city) {
                    return true;
                }
            }
            return false;
        }

        function render(city) {
            var placeHolder = "";
            if (typeof currentFavorites === "string") {
                currentFavorites = JSON.parse(currentFavorites);
            }

            if (!city) {
                for (let i = 0; i < currentFavorites.length; i += 1) {
                    placeHolder = `<a class='fav-cities-list' href='#'>
                    <li>` + currentFavorites[i] + `</li>
                    <span class='cross'>
                        <i class='fa fa-times' aria-hidden='true'></i>
                    </span>
                    </a>`;

                    $ulFavorites.append(placeHolder);
                }
            } else {
                placeHolder = `<a class='fav-cities-list' href='#'>
                <li>` + city + `</li>
                <span class='cross'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </span>
                </a>`;
                $ulFavorites.append(placeHolder);
            }
        }

        function addCity() {
            var $cityName = $(".city-name").text();
            if (!checkForExistingCity($cityName)) {
                render($cityName);
                currentFavorites.push($cityName);
                localStorage.setItem("favorites", JSON.stringify(currentFavorites));
            } else {
                // error
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
            deleteCity
        }
    })();
});