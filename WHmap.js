var map = L.map('map', {maxZoom:26, zoomControl: false}).setView([10.5144, -85.3695], 19);
L.control.scale().addTo(map);

// base map (satelite images)
L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  attribution: 'Satelite images courtesy of Google',
  maxZoom: 19,
  opacity: 1,
}).addTo(map);


// add GPS track to map     
var track = L.polyline(WHtrack, {color: 'yellow', opacity:1, weight:3, lineJoin:'round', lineCap:'round', dashArray:[10,10]}).addTo(map);




///////////////////////////////////////////////////////////////////////////////
// OBSERVATIONAL DATA LAYER


function popupHTML(cluster)
{
  var pointsToShow = 5;
  
  var points;
  if (cluster.getAllChildMarkers)
  {
    points = cluster.getAllChildMarkers();
  } else {
    points = [cluster]; // singleton is just a marker
  }
  
  
  
  var category = points[0].options.category;
  
  var startIndex = (pointsToShow >= points.length) ? points.length - 1 
    : points.length - 1 - Math.floor((Math.random()*(points.length - pointsToShow)));
    
  var html = '<div class="popup-title popup-title-c' + category + '">' + categories[category].name + '</div><table class="behaviorList">';
  
  for (var i = 0; i < pointsToShow && i < points.length; i++)
  {    
    var ops = points[startIndex - i].options;
    html += '<tr><td class="behavior-timestamp">' + ops.time + '</td><td class="behavior-point">' + ops.text + '</td></tr>';
  }
  
  if (pointsToShow < points.length)
  {
    html += '<tr><td></td><td class="behavior-zoom-note">Zoom in for more (+)</td></tr>';
  }
  
  html += "</table>";
  return html;
}  


function openPopup(target) {
  target.layer.bindPopup(popupHTML(target.layer), {'minWidth':400, 'className':'behavior-popup'}).openPopup();
}

  
function clusterIconFactory(category)
{
  var clusterIcon = function(cluster)
  {
    var childCount = cluster.getChildCount();  
    
    	var sizeclass = ' marker-cluster-';
    	var iconSize = null;
      if (childCount == 1)
      {
        sizeclass += 'singleton';
        iconSize= new L.Point(30, 30);
      }
      else if (childCount < 5) 
      {
        sizeclass += 'xsmall';
        iconSize= new L.Point(40, 40);
      } 
      else if (childCount < 20) 
      {
        sizeclass += 'small';
        iconSize= new L.Point(50, 50);
      } 
      else if (childCount < 50)
      {
        sizeclass += 'medium';
        iconSize= new L.Point(60, 60);
      }
      else {
        sizeclass += 'large';
        iconSize= new L.Point(70, 70);
      }
    
    return new L.DivIcon({ 
      html: '<div category="' + category + '"><span>' + childCount + '</span></div>', 
      className: "marker-cluster marker-cluster-c" + category + sizeclass, 
      iconSize: iconSize });
  }
  return clusterIcon;
}

// to pass to Leaflet layer control
var behaviorLayers = {};

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

    
  for (var i = 0; i < points.length; i++)
  {
    var row = points[i];
  
    clusterLayer.addLayer(new L.marker(
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
  
  behaviorLayers[categoryInfo.name] = clusterLayer;
  
  if (categoryInfo.default)  { clusterLayer.addTo(map); } 
  
  // open popup on click
  clusterLayer.on('clusterclick', openPopup);
  clusterLayer.on('click', openPopup);

}

// free up some memory
behaviorPoints = null;


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
var popup = L.popup()
    .setLatLng(WHtrack[0])
    .setContent(startpopup)
    .openOn(map);



///////////////////////////////////////////////////////////////////////////////
// MAP CONTROLS

// add layer control
L.control.layers(null, behaviorLayers, {position:'topleft'}).addTo(map);

// zoom control (underneath layer control)
new L.Control.Zoom({ position: 'topleft' }).addTo(map);


