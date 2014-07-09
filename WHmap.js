var map = L.map('map', {maxZoom:26, zoomControl: false}).setView([10.5115, -85.367], 16);
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

// alternates between "leaflet-label-left" and "leaflet-label-right"
// on each successive call
var alternator = false;
function alternateClass()
{
  alternator = !alternator;
  if (alternator)
    return 'leaflet-label-left';
  else
    return 'leaflet-label-right';
}


// factory for cluster markers
function clusterIcon_old(cluster) {
  var pointsToShow = 12;

  var points = cluster.getAllChildMarkers();
  
  var startIndex = (pointsToShow >= points.length) ? points.length - 1 
    : points.length - 1 - Math.floor((Math.random()*(points.length - pointsToShow)));
  
  var html = '<div class="innerlabel"><div class="clusterpoint timestamp">' 
    + points[startIndex].options.time + '</div>';
  
  for (var i = 0; i < pointsToShow && i < points.length; i++)
  {    
    var ops = points[startIndex - i].options;
    html += '<div class="clusterpoint r' + ops.rank + ' c' + ops.category + '">' + ops.text + '</div>';
  }
  
  if (points.length > pointsToShow)
    html += '<div class="clusterpoint more"> + ' + (points.length - pointsToShow) + ' more</div>';
  
  html += '</div>';
  
  return L.divIcon({
    className: 'cluster-label leaflet-label ' + alternateClass(),
    iconSize: ['auto', 'auto'],
    html: html,
  });
  
}


function popupHTML(cluster)
{
  var pointsToShow = 12;
  
  var points = cluster.getAllChildMarkers();
  
  var startIndex = (pointsToShow >= points.length) ? points.length - 1 
    : points.length - 1 - Math.floor((Math.random()*(points.length - pointsToShow)));
    
  var html = '<b>Category</b>" <span class="behavior-timestamp">' 
    + points[startIndex].options.time + '</span><ul>';
  
  for (var i = 0; i < pointsToShow && i < points.length; i++)
  {    
    var ops = points[startIndex - i].options;
    html += '<li class="behaviorPoint-' + ops.rank + '">' + ops.text + '</li>';
  }
  
  html += "</ul>";
  return html;
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
  clusterLayer.on('clusterclick', function (a) {
    a.layer.bindPopup(popupHTML(a.layer)).openPopup();
  });
  clusterLayer.on('click', function (a) {
    a.layer.bindPopup(popupHTML(a.layer)).openPopup();
  });
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




///////////////////////////////////////////////////////////////////////////////
// MAP CONTROLS

// add layer control
L.control.layers(null, behaviorLayers, {position:'topleft'}).addTo(map);

// zoom control (underneath layer control)
new L.Control.Zoom({ position: 'topleft' }).addTo(map);


///////////////////////////////////////////////////////////////////////////////
// MAP MOUSE EVENT HANDLERS


// add or remove layers to the map based on the zoom level
function zoomHandle() {

  //lowerMarkers();
  //shrinkHilights();

  if (map.getZoom() > 16)
  {
    map.removeLayer(hilightLayer);
    //map.addLayer(behaviorLayer);
  }
 /* else if (map.getZoom() == 17)
  {
    map.addLayer(behaviorLayer);
    map.addLayer(hilightLayer);
  } */
  else
  {
    //map.removeLayer(behaviorLayer);
    //if (!map.hasLayer(hilightLayer))
    //map.addLayer(hilightLayer);
  }
}
zoomHandle();
map.on('zoomend', zoomHandle);



// raise a marker to the top when clicked or moused over
function raiseMarker() {
  lowerMarkers();
  $(this).addClass('top');
  if (!$(this).attr('origZ'))
    {$(this).attr('origZ', $(this).css('z-index'));}
  $(this).css('z-index', 99999);
}

// lower all markers on mouseout or when something else is clicked
function lowerMarkers() {
  $('div.leaflet-label.top').each(function() {
    if ($(this).attr('origZ'))
      {$(this).css('z-index', $(this).attr('origZ'));}
	  $(this).removeClass('top');
  });
}
/*
// expand a hilight box when it's hovered or clicked/tapped
function expandHilight() {
  shrinkHilights();
  $(this).addClass('expanded');
  $(this).find('div.hContent').show();
  $(this).find('img.thumbnail').hide();
}

// shrink hilights on mouseout or when something else on the map is clicked
function shrinkHilights() {
  $('div.hContent').hide();
  $('img.thumbnail').show();
  $('div.hilight-label.expanded').removeClass('expanded');
}
*/



// Event listners for markers.  This is ugly.  Should use jQuery's 'on'
// or 'delegate' instead, but mouseover events don't propagate up past
// div.leaflet-marker-pane for some reasons unknown to me.  This needs to
// be called every time the map is re-drawn.
function bindMouseListners()
{
  $('div.leaflet-label').mouseenter(raiseMarker).click(raiseMarker);
  $('div.leaflet-label').mouseleave(lowerMarkers);
  $('.leaflet-overlay-pane').click(lowerMarkers).click(shrinkHilights);
  $('div.hilight-label').mouseenter(expandHilight).click(expandHilight);
  $('div.hilight-label').mouseleave(shrinkHilights);
  $('img.illustration').click(mediaOverlay);
}

bindMouseListners();
map.on('moveend', bindMouseListners);
