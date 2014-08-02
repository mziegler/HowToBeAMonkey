var initialView = [[10.5147, -85.3698], 19];

var map = L.map('map', {
  maxZoom:21, 
  zoomControl: false, 
  attributionControl: false,
  maxBounds: L.latLngBounds([10.5177, -85.3605], [10.5065, -85.3745]),
  }).setView(initialView[0], initialView[1]);


// base map (satelite images)
L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  maxZoom: 19,
  opacity: 1,
}).addTo(map);


// add GPS track to map     
var track = L.polyline(WHtrack, {color: 'white', opacity:1, weight:3, lineJoin:'round', lineCap:'round', dashArray:[10,10]}).addTo(map);



///////////////////////////////////////////////////////////////////////////////
// HEADER LINKS

function openSidePanel(contentSelector)
{
  $('.side-panel-content').hide();
  $(contentSelector).fadeIn('fast');
  $('#side-panel').fadeIn('fast');
}

function closeSidePanel()
{
  $('#side-panel').hide();
}

function resetView() {
  map.setView(initialView[0], initialView[1], {animate: true});
  startMarker.openPopup();
  closeSidePanel();
}

$('#tab-about').click( function() { openSidePanel('#panel-about'); return false; });
$('#tab-help').click( function() { openSidePanel('#panel-help'); return false; });
$('#tab-donate').click( function() { openSidePanel('#panel-donate'); return false; });
$('#tab-biographies').click( function() { openSidePanel('#panel-biographies'); return false; });

$('#tab-reset').click(resetView);

$('#close-side-panel').click(closeSidePanel);
map.on('click', closeSidePanel);



///////////////////////////////////////////////////////////////////////////////
// MAP CONTROLS

// add layer control
var layerControl = L.control.groupedLayers(null, null, {position:'topleft'}).addTo(map);

// zoom control (underneath layer control)
L.control.zoom({ position: 'topleft' }).addTo(map);

L.control.scale().addTo(map); // scale control



///////////////////////////////////////////////////////////////////////////////
// BEHAVIOR POPUPS

function popupHTML(cluster)
{ 
  var points;
  if (cluster.getAllChildMarkers)
  {
    points = cluster.getAllChildMarkers()
    .sort(function(a,b) {
      return a.options.time.localeCompare(b.options.time);
    });
  } else {
    points = [cluster]; // singleton is just a marker
  }
  
  var category = points[0].options.category;
    
  var html = '<div class="popup-title popup-title-c' + category + '">' + categories[category].name + '</div><div class="behavior-list"><table>';
  
  for (var i = 0; i < points.length; i++)
  {    
    var ops = points[i].options;
    html += '<tr><td class="behavior-timestamp">' + ops.time + '</td><td class="behavior-point">' + ops.text + '</td></tr>';
  }
  
  html += "</table></div>";
  return html;
}  


function openPopup(target) {
  
  var offset = target.layer.options.icon.popupOffset || target.layer._iconObj.popupOffset;

  target.layer.bindPopup(popupHTML(target.layer), {
    'minWidth':400, 
    'className':'behavior-popup',
    'offset':offset,
  }).openPopup();
}



///////////////////////////////////////////////////////////////////////////////
// BEHAVIOR CLUSTER MARKERS
  
  
function scatterAnchor(anchorCenter, range)
{
  return [ (range / 2) - (Math.random() * range) + anchorCenter[0], 
           (range / 2) - (Math.random() * range) + anchorCenter[1]  ]; 
}
  
  
function clusterIconFactory(category)
{

  var invisibleIcon = L.icon({
    iconSize: [0,0],
    iconUrl: 'libraries/images/quote.png',
  });

  return function(cluster)
  {
    // return invisible icons when zoomed out (hack - 
    // removing the layers woud mess up layer control)
    if (map.getZoom() <= 15) 
    {
      return invisibleIcon;
    }
    
    
    var childCount = cluster.getChildCount();
   
    var iconSize = [48, 48]; 
    if (childCount < 10)
    {
      iconSize = [32, 32];
    }

  
    var anchorPoint = scatterAnchor([iconSize[0] / 2, iconSize[1] / 2], 170)
      
    var icon = L.icon({
      iconUrl: 'icons/48/' + category + '.png',
      iconSize: iconSize,
      iconAnchor: anchorPoint,
      className: 'behavior-icon',
    });
      
    icon.popupOffset = [-anchorPoint[0] + iconSize[0]/2, -anchorPoint[1] + iconSize[1]/2 - 10];
      
    return icon;
    
  }
  
}

for (var category in behaviorPoints)
{
  var points = behaviorPoints[category];
  var categoryInfo = categories[category];
  
  var clusterLayer = new L.markerClusterGroup({
    spiderfyOnMaxZoom: false,
    iconCreateFunction: clusterIconFactory(category),
    showCoverageOnHover: false,
    maxClusterRadius: 150,
    zoomToBoundsOnClick: false,
    singleMarkerMode: true,
  });

  var markers = [];    
  for (var i = 0; i < points.length; i++)
  {
    var row = points[i];
  
    markers.push(new L.marker(
      [
        row[0],
        row[1]
      ], {
          time: row[2],
          rank: row[4],
          category: row[5],
          text: row[3],
      })
    );
  }
  clusterLayer.addLayers(markers);
  

  layerControl.addOverlay(clusterLayer, '<img src="icons/48/' + category + '.png" class="legend-icon" /><span class="legend-label">' + categoryInfo.name + '</span>', categoryInfo.group);
  
  if (categoryInfo.default)  { clusterLayer.addTo(map); } 
  
  // open popup on click
  clusterLayer.on('clusterclick', openPopup);
  clusterLayer.on('click', openPopup);

}

// free up some memory
behaviorPoints = null;


///////////////////////////////////////////////////////////////////////////////
// TEXT BOX LAYER
var textBoxLayer = L.layerGroup();


for (var i = 0; i < textBoxes.length; i++)
{
  var quoteIcon = L.icon({
    iconUrl: 'libraries/images/quote.png',
    shadowUrl: 'libraries/images/quoteShadow.png',
    iconSize:     [40,40], // size of the icon
    iconAnchor:   [15 + textBoxes[i][3][0], 35 + textBoxes[i][3][1]], // point of the icon which will correspond to marker's location
    popupAnchor:  [10 - textBoxes[i][3][0], -35 - textBoxes[i][3][1]], // point from which the popup should open relative to the iconAnchor
    shadowAnchor: [15 + textBoxes[i][3][0], 35 + textBoxes[i][3][1]]
  });

  textBoxLayer.addLayer(
    L.marker(textBoxes[i][0], {icon:quoteIcon}).bindPopup(
    '<div class="popup-title">' +
    textBoxes[i][1] +
    '</div><div class="caption">' +
    textBoxes[i][2] + 
    '</div>', 
    {className:'behavior-popup'})
  );
}
textBoxLayer.addTo(map);



///////////////////////////////////////////////////////////////////////////////
// PICTURE LAYER


var pictureLayer = L.layerGroup();

for (var i = 0; i < pictures.length; i++)
{
  var picture = pictures[i];
  
  pictureLayer.addLayer(
    L.marker(picture[0], {
      icon: L.icon({
        iconUrl: 'pictures/thumbnails/' + picture[1],
        className: 'picture-icon',
        iconSize: picture[3],
        iconAnchor: picture[4],
        popupAnchor: [picture[3][0]/2 - picture[4][0], -picture[4][1]],
      })
    })
    .on('click', (
    
      // wonky hack to open lightbox
      function(picture) {
        return (function() {
          $('a#lightbox-trigger')
            .attr('href', 'pictures/' + picture[1])
            //.attr('href', 'javascript:alert("s")')
            .attr('data-lightbox', 'pictureLayer-' + i)
            .attr('data-title', picture[2])
            .click();
        })
      })(picture) // call with current picture
      
    )
  );
}


pictureLayer.addTo(map);




///////////////////////////////////////////////////////////////////////////////
// START AND END POINTS


var startMarker = L.marker(WHtrack[0]).addTo(map).bindPopup(startPopup, {'minWidth':400, 'className':'behavior-popup'}).openPopup();
var endMarker = L.marker(WHtrack[WHtrack.length - 1]).addTo(map).bindPopup(endPopup);


//////////////////////////////////////////////////////////////////////////////
// ZOOM
// add or remove layers to the map based on the zoom level
function zoomHandle() 
{
  if (map.getZoom() <= 17)
  {
    map.removeLayer(pictureLayer);
    map.closePopup();
  }
  else
  {
    map.addLayer(pictureLayer);
  }
  
  
  if (map.getZoom() <= 16)
  {
    map.removeLayer(textBoxLayer);
  }
  else
  {
    map.addLayer(textBoxLayer);
  }
  
  
  if (map.getZoom() <= 14)
  {
    map.removeLayer(endMarker);
  }
  else
  {
    map.addLayer(endMarker);
  }
}
zoomHandle();
map.on('zoomend', zoomHandle);


