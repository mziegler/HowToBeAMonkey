var map = L.map('map', {
  maxZoom:22, 
  zoomControl: false, 
  attributionControl: false,
  }).setView([10.5147, -85.3695], 19);


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

$('#tab-about').click( function() { openSidePanel('#panel-about'); return false; });
$('#tab-help').click( function() { openSidePanel('#panel-help'); return false; });
$('#tab-donate').click( function() { openSidePanel('#panel-donate'); return false; });
$('#tab-biographies').click( function() { openSidePanel('#panel-biographies'); return false; });

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
  
  return [200,200]
}
  
  
function clusterIconFactory(category)
{

  return function(cluster)
  {
    
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
textBoxLayer = L.layerGroup();

var quoteIcon = L.icon({
  iconUrl: 'libraries/images/quote.png',
  iconSize:     [40,40], // size of the icon
  iconAnchor:   [15,35], // point of the icon which will correspond to marker's location
  popupAnchor:  [10,-40] // point from which the popup should open relative to the iconAnchor
});

for (var i = 0; i < textBoxes.length; i++)
{
  textBoxLayer.addLayer(
    L.marker(textBoxes[i][0], {icon:quoteIcon}).bindPopup(textBoxes[i][1])
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
        iconAnchor: [picture[3][0]/2, picture[3][1]/2],
      })
    }).bindPopup('<img src="pictures/preview/' + picture[1] + '" /><div class="caption">' + picture[2] + '</div>', {
      className: 'behavior-popup',
    })
  );
}


pictureLayer.addTo(map);



///////////////////////////////////////////////////////////////////////////////
// HILIGHTS LAYER

var hilightLayer = L.layerGroup();

// add hilights
for (var i = 0; i < hilights.length; i++)
{
  var hilight = hilights[i];
  
  var mediastring = '';
  var thumbstring = ''
  if (hilight[4]) // if there's an image
  {
    mediastring = '<img class="illustration" i="' + i + '" src="pictures/' + hilight[4] + '" alt="' + hilight[0] + '" />';
    thumbstring = '<img class="thumbnail" src="pictures/' + hilight[4] + '" alt="' + hilight[0] + '" />';
  }
  
  var markerHTML = '<div class="innerlabel"><span class="hLabel">' + thumbstring + hilight[0] + '</span><div class="hContent">' + mediastring + hilight[3] + '</span></div>';
  
  hilightLayer.addLayer(new L.marker(
    hilight[1],
    {
      icon: L.divIcon({
        className: 'leaflet-label hilight-label leaflet-label-' + hilight[2],
        html: markerHTML,
        //iconSize: ['auto', 'auto']
      })
    }
 ));   
}

//hilightLayer.addTo(map);




///////////////////////////////////////////////////////////////////////////////
// PICTURE AND VIDEO OVERLAY

// fullscreen when the picture in a hilight gets clicked
function mediaOverlay() {
  var i = parseInt($(this).attr('i'));
  var hilight = hilights[i];
  var mediastring;
  
  if (hilight[5])
  {
    // if there's a video
    mediastring = '<iframe width="420" height="375" src="' 
      + hilight[5] + '&autoplay=1" frameborder="0" allowfullscreen></iframe>';
  }
  else { mediastring = '<img src="pictures/' + hilight[4] +'" />'; }
  
  
  var caption = hilight[3];
  
  $('div#mediacontainer').html(mediastring);
  $('div#mediacaption').html(caption);
  $('div#mediabg').fadeIn();  
}
$('div#mediabg, div#mediacontainer img').click(function(){
  $('div#mediabg').fadeOut();
  $('div#mediacontainer').empty();
});



///////////////////////////////////////////////////////////////////////////////
// START AND END POINTS


var startMarker = L.marker(WHtrack[0]).addTo(map).bindPopup(startPopup, {'minWidth':400, 'className':'behavior-popup'}).openPopup();
var endMarker = L.marker(WHtrack[WHtrack.length - 1]).addTo(map).bindPopup(endPopup);





