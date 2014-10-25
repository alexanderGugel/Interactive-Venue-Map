L.mapbox.accessToken = 'pk.eyJ1IjoiYWxleGFuZGVyZ3VnZWwiLCJhIjoiTHF6V3lBdyJ9.azWklrByWOL7jmYb0KSRdQ';

var InteractiveVenueMap = function (id, options) {
  id = id || 'map';
  options = options || 'alexandergugel.k21hb9dm';

  this._initMap(id, options);
  this._initClusterGroup();
};

InteractiveVenueMap.prototype._initMap = function (id, options) {
  this.map = L.mapbox.map(id, options);
};

InteractiveVenueMap.prototype._initClusterGroup = function () {
  this.venueClusterGroup = new L.MarkerClusterGroup({
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
        className: 'venue-marker',
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

  this.map.addLayer(this.venueClusterGroup);
};

InteractiveVenueMap.prototype.renderVenues = function (venues) {
  for (var i = 0; i < 100; i++) {
    var marker = L.marker(new L.LatLng(i, i), {
        icon: L.divIcon({
          iconSize: L.point(30, 30),
          className: 'venue-marker',
          html: '<div class="venue"></div>'
        }),
        title: i
    });
    marker.bindPopup(i);
    this.venueClusterGroup.addLayer(marker);
  }
};

InteractiveVenueMap.prototype.clearVenues = function () {
  InteractiveVenueMap.clearLayers();
};


var interactiveVenueMap = new InteractiveVenueMap();
interactiveVenueMap.renderVenues();
