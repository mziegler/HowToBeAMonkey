





/////////////////////////////////////////////////////////////////////////////
// INITIALIZE LEAFLET MAP and plot data


function initMap() {


// initial pan and zoom of the map
var initialView = [[10.5147, -85.3698], 18];



var map = L.map('map', {
  maxZoom:19, 
  zoomControl: false, 
  attributionControl: false,
  maxBounds: L.latLngBounds([10.525, -85.3605], [10.5065, -85.3745]),
}).setView(initialView[0], initialView[1]);


// base map (satelite images)
L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  maxZoom: 19,
  opacity: 1,
}).addTo(map);







var rioCabuyo = L.polyline(media.cabuyoPoints, {
  color: 'lightblue',
  opacity: 0.7,
  weight: 8,
  lineJoin:'round', 
  lineCap:'round',
}).addTo(map);

var rioPizote =  L.polyline(media.pizotePoints, {
  color: 'lightblue',
  opacity: 0.7,
  weight: 5,
  lineJoin:'round', 
  lineCap:'round',
}).addTo(map);

// add GPS track to map     
var track = L.polyline(media.WHtrack, { 
    color: 'white', 
    opacity:1,
    weight:5, 
    lineJoin:'round', 
    lineCap:'round', 
    dashArray:[10,10],
  }).addTo(map);
  
  







///////////////////////////////////////////////////////////////////////////////
// COMPUTE POPUP SIZE SO IT FITS IN THE MAP



(function() {


  // Given ideal/full popup width, scale down popup so it fits in window if neccesary
  function popupWidth(fullWidth) {
    var width = fullWidth,
      mapSize = map.getSize();
        if (width > mapSize.x - 25) {
      width = mapSize.x - 25;
    }
      return width;
  }


  // keep track of the currently-opened popup
  var currentPopup = null;
  
  
  // keep track of open popup 
  
  map.on('popupopen', function(event) {
    currentPopup = event.popup;
    
    // if the popup is too wide for the screen, shrink it down
    if (currentPopup.options.fullWidth) {
      var width = popupWidth(currentPopup.options.fullWidth);
      if (width < currentPopup.options.minWidth) {
        currentPopup.options.minWidth = currentPopup.options.maxWidth = width;
        currentPopup.update();
      }
    }
  });
  
  
  // recompute popup size on map resize
  map.on('resize', function() {
    if (map.hasLayer(currentPopup) 
      && currentPopup.options.fullWidth)     {
      
      currentPopup.options.minWidth = currentPopup.options.maxWidth = 
                              popupWidth(currentPopup.options.fullWidth);
      currentPopup.update();
    }
  });
})();





///////////////////////////////////////////////////////////////////////////////
// MAP CONTROLS

// zoom control (underneath layer control)
L.control.zoom({ position: 'topleft' }).addTo(map);

L.control.scale().addTo(map); // scale control





///////////////////////////////////////////////////////////////////////////////
// MONKEYFACE MARKER (when map is zoomed out)
var monkeyfaceMarker = L.marker([10.5147, -85.3698], {
  icon: L.icon({
    iconUrl: '/icons/monkeyface-marker.png',
    iconSize: [134,160],
    iconAnchor: [67, 160],
  })
}).on('click', function() {
  map.setView(tour.getTourStop().loc, 18);
});



//////////////////////////////////////////////////////////////////////////////
// ZOOM
// add or remove layers to the map based on the zoom level
// cluster layer zoom behavior handled in clusterIconFactory function
var previousZoom = map.getZoom();
function zoomHandle() {

  var lastZoom = previousZoom;
  previousZoom = map.getZoom();

  map.closePopup();  
  
  if (map.getZoom() < 18) {
    map.removeLayer(track);
    map.removeLayer(rioCabuyo);
    map.removeLayer(rioPizote);
    map.addLayer(monkeyfaceMarker);
  }
  else {
    map.addLayer(track);
    map.addLayer(rioCabuyo);
    map.addLayer(rioPizote);
    map.removeLayer(monkeyfaceMarker);
  }
  
  
  
  if (18 > map.getZoom() && map.getZoom() > 6)  {
    if (map.getZoom() > lastZoom) {
      map.setView(tour.getTourStop().loc, 18);
    }
    else {
      map.setZoom(6);
    }
  }

  
}
zoomHandle();
map.on('zoomend', zoomHandle);







return {
  map: map,
  //startMarker: startMarker,
  initialView: initialView,
  }
}

var map = initMap();


