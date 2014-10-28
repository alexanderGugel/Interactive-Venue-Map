L.mapbox.accessToken = 'pk.eyJ1IjoiYWxleGFuZGVyZ3VnZWwiLCJhIjoiTHF6V3lBdyJ9.azWklrByWOL7jmYb0KSRdQ';

var InteractiveVenueMap = function (container, options) {
  this.container = container || $('#interactive-venue-map');
  this.mapElement = this.container.find('.map')[0];

  options = options || {};
  options.mapboxId = options.mapboxId || 'alexandergugel.k21hb9dm';

  options.zoomControl = options.zoomControl || false;

  this._initMap(options);
  this._initClusterGroup();
  this._initControl();
};

InteractiveVenueMap.prototype._initMap = function (options) {
  this.map = L.mapbox.map(this.mapElement, options.mapboxId, options);
};

InteractiveVenueMap.prototype._initControl = function () {
  var main = this.container.find('main');
  var toggleButton = this.container.find('.toggle');

  toggleButton.on('click', function () {
    $(this).find('i').toggleClass('inactive');
    main.toggle(100);
  });

  


};

InteractiveVenueMap.prototype._clusterToMarkers = function (cluster) {
  var markers = cluster._markers.slice();

  var clusters = cluster._childClusters;

  for (var i = 0; i < clusters.length; i++) {
    markers = markers.concat(this._clusterToMarkers(clusters[i]));
  }

  return markers;
};

InteractiveVenueMap.prototype._initCategoryFilter = function () {
  $(this.id).find('.category-filter').empty();
};

InteractiveVenueMap.prototype._initClusterGroup = function () {
  var self = this;

  this.venueClusterGroup = new L.MarkerClusterGroup({
    disableClusteringAtZoom: 16,
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
          var markers = self._clusterToMarkers(cluster);
          for (var i = 0; i < markers.length; i++) {
            html += self._venueToMarkerHTML(markers[i]._venue);
          }
          return html;
        })()
      });
    }
  });

  this.map.addLayer(this.venueClusterGroup);
};

InteractiveVenueMap.prototype._jumpTo = function (map, oldMarker, newMarker) {
  if (!map || !oldMarker || !newMarker) {
    return;
  }
  oldMarker.closePopup();
  map.panTo(newMarker.getLatLng());
  setTimeout(function () {
    newMarker.openPopup();
  }, 300);
};

InteractiveVenueMap.prototype._venueToPopup = function (venue) {
  var self = this;

  var header = $('<header />');
  var h1 = $('<h1 />');
  header.append(h1);

  var main = $('<main />');
  var description = $('<p />')
  main.append(description);

  var html = $('<div />');
  html.append(header);
  html.append(main);

  description.text(venue.description);
  h1.text(venue.name);

  header.css({
    background: 'url(' + venue.image + ')'
  });

  var venueIndex = this.venues.indexOf(venue);

  var previousLink = $('<a href="#" class="previous-venue">&laquo; Previous</a>').click(function (event) {
    var previousVenue = self.venues[venueIndex - 1];
    self._jumpTo(self.map, venue._marker, previousVenue._marker);
  });

  var progressReport = $('<span class="progress">' + (venueIndex + 1) + '/' + this.venues.length + '</span>');

  var nextLink = $('<a href="#" class="next-venue">Next &raquo;</a>').click(function (event) {
    var nextVenue = self.venues[venueIndex + 1];
    self._jumpTo(self.map, venue._marker, nextVenue._marker);
  });

  main.append(previousLink);
  main.append(progressReport);
  main.append(nextLink);

  return html[0];
};

InteractiveVenueMap.prototype._venueToMarkerHTML = function (venue) {
  return '<div class="venue" style="background: ' + venue._category.color + '"></div>';
};

InteractiveVenueMap.prototype._venueToMarker = function (venue) {
  var marker = L.marker(new L.LatLng(venue.lat, venue.lng), {
      icon: L.divIcon({
        popupAnchor: L.point(0, -15),
        iconSize: L.point(30, 30),
        className: 'venue-marker',
        html: this._venueToMarkerHTML(venue)
      }),
      title: venue.name
  });
  marker._venue = venue;
  venue._marker = marker;
  marker.bindPopup(this._venueToPopup(venue), {
    closeButton: false
  });
  this.venueClusterGroup.addLayer(marker);
}

InteractiveVenueMap.prototype.render = function (categories) {
  this.venues = [];
  this.categories = categories;

  for (var i = 0; i < categories.length; i++) {
    var category = categories[i];
    for (var j = 0; j < category.subCategories.length; j++) {
      var subCategory = category.subCategories[j];
      for (var k = 0; k < subCategory.venues.length; k++) {
        var venue = subCategory.venues[k];
        venue._category = category;
        venue._subCategory = subCategory;
        this.venues.push(venue);
      }
    }
  }

  for (var l = 0; l < this.venues.length; l++) {
    this._venueToMarker(this.venues[l]);
  }

  this._initCategoryFilter();
};

InteractiveVenueMap.prototype.clearVenues = function () {
  delete this.venues;
  InteractiveVenueMap.clearLayers();
};

var InteractiveVenueMapModule = angular.module('InteractiveVenueMapControl', []);

InteractiveVenueMapModule.directive('map', [function () {
  var map;

  var link = function (scope, element, attrs) {
    element.addClass('interactive-venue-map');
    map = map || new InteractiveVenueMap(element[0]);
  };

  return {
    restrict: 'E',
    link: link
  };
}]);
