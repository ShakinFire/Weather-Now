script >
    function initMap() {
        var mapProp = {
            center: new google.maps.LatLng(51.508742, -0.120850),
            zoom: 5,
        };
        var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
    } <
    /script>

<
script src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDkUlIYkH9OJ-loM6ADhmojHM6Ve7yHaSw&callback=initMap" > < /script>