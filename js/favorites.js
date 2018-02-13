var favorites = (function () {
    var currentFavorites = data.getFavorites();
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
