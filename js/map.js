'use strict';

L.mapbox.accessToken = 'pk.eyJ1IjoiYWxleGFuZGVyZ3VnZWwiLCJhIjoiTHF6V3lBdyJ9.azWklrByWOL7jmYb0KSRdQ';

var InteractiveVenueMap = function () {
  this.container = $('#interactive-venue-map');
  this.mapElement = this.container.find('.map')[0];

  var options = {};
  options.mapboxId = 'alexandergugel.k21hb9dm';

  options.zoomControl = false;

  this._initMap(options);
  this._initClusterGroup();
};

InteractiveVenueMap.prototype._initMap = function (options) {
  this.map = L.mapbox.map(this.mapElement, options.mapboxId, options);

  this.zoomControl = L.control.zoom({
    position: 'topright'
  });

  this.zoomControl.addTo(this.map);
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
  this.venueClusterGroup.zoomToShowLayer(newMarker, function () {
    newMarker.openPopup();
  });
};

InteractiveVenueMap.prototype._venueToPopup = function (venue) {
  var self = this;

  var header = $('<header />');
  var h1 = $('<h1 />');
  // var closeButton = $('<button />');
  // closeButton.text('✖');

  // closeButton.click(function (evene) {
  //
  // });

  // header.apend(closeButton);
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

  progressReport.append(previousLink);
  progressReport.append(nextLink);
  main.append(progressReport);

  return html[0];
};

InteractiveVenueMap.prototype._venueToMarkerHTML = function (venue) {
  var html = '';
  html += '<div class="venue" style="background: ' + venue._category.color + '">';
  html += venue._subCategory.icon ? '<img src="' + venue._subCategory.icon + '">' : '';
  html += '</div>';
  return html;
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
    // closeButton: false
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
        if (!category.hidden || !subCategory.hidden) {
          var venue = subCategory.venues[k];
          venue._category = category;
          venue._subCategory = subCategory;
          this.venues.push(venue);
        }
      }
    }
  }

  for (var l = 0; l < this.venues.length; l++) {
    this._venueToMarker(this.venues[l]);
  }

  this._initCategoryFilter();
};

InteractiveVenueMap.prototype.clearVenues = function () {
  delete this.categories;
  delete this.venues;
  this.venueClusterGroup.clearLayers();
};

InteractiveVenueMap.prototype.rerender = function () {
  var venues = this.categories.slice();
  this.clearVenues();
  this.render(venues);
};

var InteractiveVenueMapModule = angular.module('InteractiveVenueMap', []);

InteractiveVenueMapModule.run(['$window', function ($window) {
  $window.interactiveVenueMap = new InteractiveVenueMap();
  $window.interactiveVenueMap.render($window.venues);
}]);

InteractiveVenueMapModule.controller('FilterCtrl', ['$scope', '$window', function($scope, $window) {
  $scope.venues = $window.venues;

  $scope.selectedCategory = $scope.venues[0];

  $scope.changeCategory = function (category) {
    $scope.selectedCategory = category;
  };

  $scope.toggleCategory = function (category, subCategory) {
    if (subCategory) {
      subCategory.hidden = !subCategory.hidden;
      category.hidden = true;
    } else {
      category.hidden = !category.hidden;
      for (var i = 0; i < category.subCategories.length; i++) {
        category.subCategories[i].hidden = true;
      }
    }
    $window.interactiveVenueMap.rerender();
  };

  $scope.countVenues = function (category) {
    var count = 0
    for (var i = 0; i < category.subCategories.length; i++) {
      count += category.subCategories[i].venues.length;
    }
    return count;
  }
}]);
