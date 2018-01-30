var database = (function () {
    var citiesList = [];

    var _addInCitiesList = function (data) {
        $(data["values"]).each(function (index, elem) {
            citiesList.push(elem);
        });
    }
    var _getAllCities = (function () {
        $.getJSON("cities.json", _addInCitiesList);
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

    var getWeatherInfo = function (city, unit, successCallback, failCallback) {
        var un = unit || "metric";
        var url = "http://api.openweathermap.org/data/2.5/weather?q=" + city +
            "&appid=b566e35c1181791b83b9aefcbe9be910&units=" + un;

        function makeRequest() {
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
        // makeRequest().done(successCallback(data));
        // makeRequest().fail(failCallback());
        makeRequest().then(function (data) {
            console.log(data)
            data = _flattenObject(data);
            successCallback(data);
            console.log(data)

        });

        makeRequest().catch(function () {
            failCallback();

        });
    }

    return {
        citiesList,
        getWeatherInfo
    }

})();

var DOM = (function () {

    var displayData = function (obj) {
        // if ($(".content").hasClass('hidden')) {
        //     $(".content").removeClass('hidden');
        //     $(".error").remove();
        // }
        function _convertFromUnixTimeStamp(t) {
            var dt = new Date(t * 1000);
            var hr = dt.getHours();
            var m = "0" + dt.getMinutes();
            var s = "0" + dt.getSeconds();
            return hr + ':' + m.substr(-2) + ':' + s.substr(-2);
        }
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
    };

    var displayError = function () {
        alert("no results find");
    }

    return {
        displayData,
        displayError
    }
})();

var app = (function () {
    var unit = "metric";

    var update = function (city, unit) {
        database.getWeatherInfo(city, unit, DOM.displayData, DOM.displayError);

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

    }

    var setUnit = function (newUnit) {
        unit = newUnit;
    }

    var getUnit = function () {
        return unit;
    }

    var init = function () {
        bindEvents();

        update("Sofia", unit)
    }

    return {
        init,
        getUnit,
        setUnit,
    }
})();

$(document).ready(function () {
    app.init();
});

// Implementing add and delete favorite city functionality

var errorScreen = function(errorText) {
    $(".error-message-text").text(errorText); // Pop up error screen with the provided error text
    $(".wrapper").css("display", "block");

    $(".close-error").on("click", function() { // 'hide' the error message when click on 'X' button
        $(".wrapper").css("display", "none");
    });

    $(".error-message-container").on("click", function(e) { // Fire an event when you click outside the box to 'hide' the error message
        $(".wrapper").css("display", "none");
    });

    $(".error-message-screen").on("click", function(e) { // Stop the event from firing on the error message screen
        e.stopPropagation();
    });
}

$(function(){
    var checkExistingName = function(cityToCheck) { // check the whole favorite list in local storage for same name
        var initialFavorites = JSON.parse(localStorage.getItem("favorites"));
        var isChecked = false;
        initialFavorites.forEach((val) => {
            if (cityToCheck === val) {
                isChecked = true;
            }
        });
        return isChecked;
    }

    var generateFavoriteCities = function() { // Every refresh generate the local storage list of favorite cities
        var initialFavorites = JSON.parse(localStorage.getItem("favorites"));
        initialFavorites.forEach((val) => {
            var placeHolder = `<a class='fav-cities-list' href='#'>
            <li>` + val + `</li>
            <span class='cross'>
                <i class='fa fa-times' aria-hidden='true'></i>
            </span>
            </a>`;
            $("#ul-fav-cities").append(placeHolder);
        });      
    }

    if (localStorage.length === 0) { // checks if there is already modified local storage, if not, set the default cities
        var holdDefault = ['Varna', 'Sofia', 'Vidin', 'Burgas'];
        localStorage.setItem("favorites", JSON.stringify(holdDefault));
        var initialFavorites = JSON.parse(localStorage.getItem("favorites"));
    }
    generateFavoriteCities();

    var deleteItem = function(deletedCity) { // Deleting city from local storage
        var initialFavorites = JSON.parse(localStorage.getItem("favorites"));
        for (let i = 0; i < initialFavorites.length; i += 1) {
            if (initialFavorites[i] === deletedCity) {
                initialFavorites.splice(i, 1);
                break;
            }
        }

        localStorage.setItem("favorites", JSON.stringify(initialFavorites));
    }

    var addCity = function(addedCity) { // Add city in local storage
        var currentFavorites = JSON.parse(localStorage.getItem("favorites"));
        currentFavorites.push(addedCity);
        localStorage.setItem("favorites", JSON.stringify(currentFavorites));
        currentFavorites = JSON.parse(localStorage.getItem("favorites"));
    }

    $("#add-city").on("click", function() { // append the whole fragment for favorite city
        var $cityName = $(".city-name").text();
        if (checkExistingName($cityName)) {
            errorScreen("This city is already in your favorite list!");
        } else {
            var placeHolder = `<a class='fav-cities-list' href='#'>
            <li>` + $cityName + `</li>
            <span class='cross'>
                <i class='fa fa-times' aria-hidden='true'></i>
            </span>
            </a>`;
            $("#ul-fav-cities").append(placeHolder);
            addCity($cityName);
        }
    });

    $(document).on("click", ".cross", function(e) { // detach the whole fragment for favorite city
        var name = $(this).prev().text();
        $(this).parent().css("display", "none");
        deleteItem(name);
        e.stopPropagation();
    });

    $(document).on("click", ".fav-cities-list", function() { // When clicked on city in the favorite list, refresh the weather-info for this city
        var a = $(this).children("li").text();
        console.log(a); // TODO attach it to the module
    });
});