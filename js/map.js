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
    // disableClusteringAtZoom: 5,
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

InteractiveVenueMap.prototype._nextClickHandler = function (event) {
  // TODO
  // Clean up
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
    if (previousVenue) {
      venue._marker.closePopup();
      self.map.setView(previousVenue._marker.getLatLng(), 30, {
        animate: true
      });
      setTimeout(function () {
        previousVenue._marker.openPopup();
      }, 250);
    }
  });

  var nextLink = $('<a href="#" class="next-venue">Next &raquo;</a>').click(function (event) {
    var nextVenue = self.venues[venueIndex + 1];
    if (nextVenue) {
      venue._marker.closePopup();
      self.map.setView(nextVenue._marker.getLatLng(), 30, {
        animate: true
      });
      setTimeout(function () {
        nextVenue._marker.openPopup();
      }, 250);
    }
  });

  main.append(previousLink);
  main.append(nextLink);

  return html[0];
};

InteractiveVenueMap.prototype.addVenues = function (venues) {
  this.venues = venues;

  for (var i = 0; i < venues.length; i++) {
    var venue = venues[i];
    var marker = L.marker(new L.LatLng(venue.lat, venue.lng), {
        icon: L.divIcon({
          popupAnchor: L.point(0, -15),
          iconSize: L.point(30, 30),
          className: 'venue-marker',
          html: '<div class="venue"></div>'
        }),
        title: venue.name
    });
    venue._marker = marker;
    marker.bindPopup(this._venueToPopup(venue), {
      closeButton: false
    });
    this.venueClusterGroup.addLayer(marker);
  }
};

InteractiveVenueMap.prototype.clearVenues = function () {
  delete this.venues;
  InteractiveVenueMap.clearLayers();
};

///

var venues = (function generateDummyVenues () {
  var venues = [];

  for (var i = 0; i < 40; i++) {
    venues.push({
      name: 'Golf Course',
      description: 'Aute incididunt officia magna tempor ad id nulla incididunt Lorem non eiusmod culpa adipisicing voluptate. Laboris veniam duis do sit ea nostrud esse ea irure in cupidatat. Irure irure cillum Lorem ex cillum anim sit exercitation eu laboris culpa proident eiusmod. Sunt proident esse exercitation mollit aliquip culpa ad. Cillum laborum ea dolore est irure laboris sit nostrud reprehenderit eu laboris tempor eiusmod incididunt. Anim mollit excepteur culpa consequat eu proident Lorem eiusmod consequat est. Commodo culpa dolor pariatur culpa proident aliqua exercitation id in commodo ut.',
      image: 'http://www.funchap.com/wp-content/uploads/2014/03/baby-elephant-and-egrets.jpg',
      lat: Math.floor(Math.random()*10),
      lng: Math.floor(Math.random()*10)
    });
  }

  return venues;
})();

var interactiveVenueMap = new InteractiveVenueMap();
interactiveVenueMap.addVenues(venues);
