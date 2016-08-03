





/////////////////////////////////////////////////////////////////////////////
// INITIALIZE LEAFLET MAP and plot data


function initMap() {


// initial pan and zoom of the map
var initialView = [[10.51422, -85.36937], 8];



// WONKY ZOOM STUFF

customScale2DefaultZoom = [0,1,2,3,4,5,6,17,20],
// custom CRS for skipping zoom levels
L.CRS.CustomZoom = L.extend({}, L.CRS.EPSG3857, {
    
  scale: function(zoom) {
    return L.CRS.EPSG3857.scale(customScale2DefaultZoom[zoom]);
  },
});


// URL for fetching tile
var tileZoomLevels = [0,1,2,3,4,5,6,17,19]; // last zoom level is scaled up on client side
function tileURL(view) {

  return 'http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
    .replace('{z}', tileZoomLevels[view.zoom])
    .replace('{x}', view.tile.column)
    .replace('{y}', view.tile.row);
}







var map = L.map('map', {
  maxZoom:8,
  zoomControl: false, 
  attributionControl: false,
  maxBounds: L.latLngBounds([10.525, -85.3605], [10.5065, -85.3745]),
  crs: L.CRS.CustomZoom,
  //zoomAnimation: false,
}).setView(initialView[0], initialView[1]);


// base map (satelite images)
new L.TileLayer.Functional(tileURL, {
  maxZoom: 7, //8
  //maxNativeZoom: 7,
  opacity: 1,
}).addTo(map);


new L.TileLayer.Functional(tileURL, {
  maxZoom: 8,
  minZoom: 8,
  opacity: 1,
  tileSize: 512,
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
    opacity:0.2,
    weight:20, 
    lineJoin:'round', 
    lineCap:'round', 
  }).addTo(map);
  
track.setText('\u2192 ', {
              repeat: true,
              offset: 22,
              attributes: {
                fill: 'white',
                'font-size': '70',
                'font-weight': 'bold',
              }
});







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






///////////////////////////////////////////////////////////////////////////////
// SHOW/HIDE 'NEXT' BUTTON SUPERPOSITIONED ON MAP


// Keep of flag of whether we're transitioning between tour stops, 
// so we don't flash the next button.
var onTourTransition = false;
function startTourTransition() {  onTourTransition = true;   }
function endTourTransition()   {  onTourTransition = false;  }

function showFloatingNext() {
  if (!onTourTransition) {
    $('#map-next').fadeIn('fast');
  }
}

function hideFloatingNext() {
  $('#map-next').fadeOut('fast');
}

map.on('popupopen', hideFloatingNext);
map.on('popupclose', showFloatingNext);



//////////////////////////////////////////////////////////////////////////////
// ZOOM
// add or remove layers to the map based on the zoom level
// cluster layer zoom behavior handled in clusterIconFactory function
var savedLastZoom = map.getZoom();

var zoomLevels = {
  detailed: 8,   // With data points
  8: 'detailed',
  
  overview: 7,   // Pictures, videos, and text only.  Clicks will zoom to detailed level
  7: 'overview',
  
  world: 6,       // View of Costa Rica, with a single marker
  6: 'world',
  5: 'world',
  4: 'world',
  3: 'world',
  2: 'world',
  1: 'world',
  0: 'world',
}


function getZoomMode() {
  return zoomLevels[map.getZoom()];
}
map.getZoomMode = getZoomMode;


// Temporarily disable zooming, so the user doesn't jump from the detailed view 
// to the world view with a single scroll wheel movement
function pauseZoom() {
  map.touchZoom.disable();
  map.scrollWheelZoom.disable();
  setTimeout(function() {
    map.touchZoom.enable();
    map.scrollWheelZoom.enable();
  },
    1000
  );
}



function zoomHandle() {


  var lastZoom = savedLastZoom;
  //savedLastZoom = map.getZoom();

  map.closePopup();  
  
  /*
  if (map.getZoom() < 15) {

  }
  else {
    
  }
  */
  
  
  if (map.getZoom() <= zoomLevels.world) {
    savedLastZoom = map.getZoom();
    map.removeLayer(track);
    map.removeLayer(rioCabuyo);
    map.removeLayer(rioPizote);
    map.addLayer(monkeyfaceMarker);
  }
  else if (map.getZoom() == zoomLevels.detailed || map.getZoom() == zoomLevels.overview) {
    pauseZoom();
    savedLastZoom = map.getZoom();
    map.addLayer(track);
    map.addLayer(rioCabuyo);
    map.addLayer(rioPizote);
    map.removeLayer(monkeyfaceMarker);
  }
  
  /*
  // In-between allowed zoom levels, so figure out the appropriate zoom
  else {
  
    if (lastZoom == zoomLevels.detailed) {
      if (lastZoom > map.getZoom()) {
        map.setZoom(zoomLevels.overview);
      }
      
      // this should never happen
      else {
        map.setZoom(zoomLevels.detailed);
      }
    }
    
    
    else if (lastZoom == zoomLevels.overview) {
      if (lastZoom > map.getZoom()) {
        map.setZoom(zoomLevels.world);
      }
      else {
        map.setZoom(zoomLevels.detailed);
      }
    }
    
    
    else if (lastZoom <= zoomLevels.world) {
      if (map.getZoom() > zoomLevels.world) {
        map.setView(tour.getTourStop().loc, zoomLevels.overview);
      }
    }
    
    
    else {
      console.log('something happened in the zoom handle code that should never happen.');
    }
    
    
  }

  */

  
}
zoomHandle();
map.on('zoomend', zoomHandle);







return {
  map: map,
  //startMarker: startMarker,
  initialView: initialView,
  
  showFloatingNext: showFloatingNext,
  hideFloatingNext: hideFloatingNext,
  startTourTransition: startTourTransition,
  endTourTransition: endTourTransition,
  
  getZoomMode:getZoomMode,
  }
}

var map = initMap();


