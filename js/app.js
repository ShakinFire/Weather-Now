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

        $(".drop-down-hamburger").on("click", function () {
            $(".drop-down-menu").slideToggle(600);
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
        $("#add-city").on("click", function(e) {
            console.log("clicked");
            favorites.addCity()
        });

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