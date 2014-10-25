L.mapbox.accessToken = 'pk.eyJ1IjoiYWxleGFuZGVyZ3VnZWwiLCJhIjoiTHF6V3lBdyJ9.azWklrByWOL7jmYb0KSRdQ';

var map = L.mapbox.map('map', 'alexandergugel.k21hb9dm');

// map.setView([40, -74.50], 9);


var markers = new L.MarkerClusterGroup({
  iconCreateFunction: function (cluster) {
    return new L.divIcon({
      iconSize: L.point(56, (function calcHeight() {
        var rows = cluster.getChildCount();
        if (rows % 2 !== 0) {
          rows++;
        }
        rows = rows/2;
        return rows*26 + 4;
      })()),
      className: 'cluster-venue-marker',
      html: (function () {
        var html = '';
        for (var i = 0; i < cluster.getChildCount(); i++) {
          html += '<div class="venue"></div>';
        }
        return html;
      })()
    });
  }
});



for (var i = 0; i < 100; i++) {
  var marker = L.marker(new L.LatLng(i, i), {
      icon: L.divIcon({
        iconSize: L.point(30, 30),
        className: 'single-venue-marker',
        html: '<div class="venue"></div>'
      }),
      title: i
  });
  marker.bindPopup(i);
  markers.addLayer(marker);
}

map.addLayer(markers);

// var map = L.map('map');

// L.tileLayer('https://{s}.tiles.mapbox.com/v3/alexandergugel.ijmgk566/{z}/{x}/{y}.png').addTo(map);
