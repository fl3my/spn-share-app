function renderMap(apiKey, markers, homeLocation = { lat: -4.250664, lng: 55.861232, }) {
    var map = tt.map({ key: apiKey, container: 'map', center: [homeLocation.lat, homeLocation.lng], zoom: 10 });

    function createMarker(position, color, popupText) {
        var marker = new tt.Marker({ color: color })
            .setLngLat(position)
            .setPopup(new tt.Popup().setHTML(popupText))
            .addTo(map);
    }

    createMarker([homeLocation.lat, homeLocation.lng], 'green', 'Home');
}