var database = (function() {
    var citiesList = [];

    var _addInCitiesList = function(data) {
        $(data["values"]).each(function(index, elem) {
            citiesList.push(elem);
        });
    }
    var _getAllCities = (function() {
        $.getJSON("cities.json", _addInCitiesList);
    })();

    var _flattenObject = function(ob) {
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

    var getWeatherInfo = function(city, unit, successCallback, failCallback) {
        var un = unit || "metric";
        var url = "http://api.openweathermap.org/data/2.5/weather?q=" + city +
            "&appid=b566e35c1181791b83b9aefcbe9be910&units=" + un;

        function makeRequest() {
            var promise = new Promise(function(resolve, reject) {
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
        makeRequest().then(function(data) {
            console.log(data)
            data = _flattenObject(data);
            successCallback(data);
            console.log(data)

        });

        makeRequest().catch(function() {
            failCallback();

        });
    }

    return {
        citiesList,
        getWeatherInfo
    }

})();

var DOM = (function() {

    var displayData = function(obj) {
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
        $('.lon').text(obj.lon);
        $('.lat').text(obj.lat);
    };

    var displayError = function() {
        alert("no results find");
    }

    return {
        displayData,
        displayError
    }
})();

var app = (function() {
    var unit = "metric";

    var update = function(city, unit) {
        database.getWeatherInfo(city, unit, DOM.displayData, DOM.displayError);

    };

    var bindEvents = function() {
        $(".button").on('click', function(e) {
            e.preventDefault();
            var value = $(".search").val();
            update(value, unit)
        });

        $(".search").autocomplete({
            source: function(request, response) {
                var matches = $.map(database.citiesList, function(acItem) {
                    if (acItem.toUpperCase().indexOf(request.term.toUpperCase()) ===
                        0) {
                        return acItem;
                    }
                });
                response(matches);
            },
            select: function(event, ui) {
                update(ui.item.value, unit);
            }

        });

    }

    var setUnit = function(newUnit) {
        unit = newUnit;
    }

    var getUnit = function() {
        return unit;
    }

    var init = function() {
        bindEvents();

        update("Sofia", unit)
    }

    return {
        init,
        getUnit,
        setUnit,
    }
})();

$(document).ready(function() {
    app.init();
});