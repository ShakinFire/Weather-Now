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