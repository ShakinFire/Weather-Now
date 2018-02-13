var DOM = (function () {
    var currentCityName = $(".city-name").text();;

    var _chooseIconClass = function(name, time) {
        var newClass = "";
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

        return newClass;
    }
    var _changeIconClass = function (newClass) {
        var defaultClass = "wi weather-icon";
        $("#icon").removeClass();
        $("#icon").addClass(defaultClass);
        $("#icon").addClass(newClass);
    }

    var _changeIcon = function (name, time) {
        let newClass = _chooseIconClass(name, time)
        _changeIconClass(newClass);
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
