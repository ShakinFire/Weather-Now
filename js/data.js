var data = (function () {
    var citiesList = [];

    var getRequest = function (url) {
        var promise = new Promise(function (resolve, reject) {
            $.ajax({
                url: url,
                datatype: "application/json",
                success: function (data) {
                    resolve(data)
                },
                error: function () {
                    reject()
                }
            });
        })
        return promise;
    }


    var _getAllCities = function () {
        getRequest("cities.json").then(function (data) {
            $(data["values"]).each(function (index, elem) {
                citiesList.push(elem);
            });
        })
    };
    _getAllCities();

    var _flattenObject = function (ob) {
        var result = {};
        for (var i in ob) {
            if (!ob.hasOwnProperty(i)) continue;
            if ((typeof ob[i]) == 'object') {
                var flatObject = _flattenObject(ob[i]);
                for (var elem in flatObject) {
                    if (!flatObject.hasOwnProperty(elem)) continue;

                    result[elem] = flatObject[elem];
                }
            } else {
                result[i] = ob[i];
            }
        }
        return result;
    };



    var getWeatherInfo = function (cityName, unit) {
        var un = unit || "metric";
        var url = "";
        url = "http://api.openweathermap.org/data/2.5/weather?q=" + cityName +
            "&appid=b566e35c1181791b83b9aefcbe9be910&units=" + un;

        return getRequest(url).then(function (data) {
            return _flattenObject(data);
        }).catch(function() {
            console.log("no city found");
            return false
        })
    }

    var getLocation = function () {
        return new Promise(function (resolve, reject) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    resolve(position);
                });
            }
        })
    };


    var getWeatherInfoByLoc = function () {
        return getLocation().then(function (position) {
            var lat = position.coords.latitude
            var lon = position.coords.longitude;
            var url = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=b566e35c1181791b83b9aefcbe9be910&units=metric";
            return getRequest(url).then(function (data) {
                return _flattenObject(data);
            })
        })
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