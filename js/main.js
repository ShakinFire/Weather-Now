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



    var _changeIcon = function (name) {
        var defaultClass = "wi weather-icon";
        var _changeClass = function (newClass) {
            $("#icon").removeClass();
            $("#icon").addClass(defaultClass);
            $("#icon").addClass(newClass);


        }
        switch (name) {
            case "Thunderstorm":
                newClass = "wi-day-snow-thunderstorm"
                break;
            case "Clouds":
                newClass = "wi-cloud"
                break;
            case "Drizzle":
                newClass = "wi-day-cloudy"
                break;
            case "Rain":
                newClass = "wi-rain"
                break;
            case "Snow":
                newClass = "wi-snowflake-cold"
                break;
            case "Clear":
                newClass = "wi-day-sunny"
                break;
            case "Extreme":
                newClass = "wi-thunderstorm"
                break;
            case "Mist":
                newClass = "wi-fog"
                break;
            case "Fog":
                newClass = "wi-fog"
                break;

            default:
                newClass = "wi-cloud"
                break;
        }

        _changeClass(newClass);

    }

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
        _changeIcon(obj.main) //changing the icon accordingly
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

        var lat = obj.lat;
        var lon = obj.lon;
        // function myMap() {

        //     var mapProp = {
        //         center: new google.maps.LatLng(obj.lat, obj.lon),
        //         zoom: 13,
        //     };
        //     var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
        // }

    };

    var displayError = function () {
        // ts find");
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

        setTimeout(() => {
            myMapChange();
        }, 400);
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