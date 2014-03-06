var map = L.map('map').setView([10.512, -85.366], 16);

      
// base map (satelite images)
L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  attribution: 'Satelite images courtesy of Google',
  maxZoom: 22
}).addTo(map);


// add GPS track to map     
var polyline = L.polyline(WHtrack, {color: 'blue'}).addTo(map);


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


function clusterIcon(cluster) {
  var childrenToShow = 3;

  var children = cluster.getAllChildMarkers();
  
  var html = '<div class="innerlabel"><ul>';
  
  for (var i=0; i<childrenToShow; i++)
  {
    var markerHtml = children[i].options.icon.options.html;
    html = html + '<li>' + markerHtml.substring(24, markerHtml.length-6) + '</li>';
    
  }
  
  html = html + '</ul>';
  
  if (children.length > childrenToShow)
    html = html + ' and ' + (children.length - childrenToShow) + ' more.';
  
  html = html + '</div>';
  
  return L.divIcon({
    className: 'leaflet-label ' + alternateClass(),
    iconSize: ['auto', 'auto'],
    html: html,
  });
  
}


// cluster layer for behavior markers
var behaviorLayer = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: false,
  iconCreateFunction: clusterIcon,
  
  });


// add behavior markers to map
for (var i = 0; i < behaviorPoints.length; i++)
{
  var row = behaviorPoints[i];
  
  behaviorLayer.addLayer(new L.marker(
    [
      row[0],
      row[1]
    ], {
      icon: L.divIcon({
        className: 'leaflet-label ' + alternateClass(),
        html: '<div class="innerlabel"><b>' + row[2] + '</b> ' + row[3] + '</div>',
        iconSize: ['auto', 'auto']
      }),
    })
  );
}


//map.addLayer(behaviorLayer);

var hilightLayer = L.layerGroup();

// add hilights
for (var i = 0; i < hilights.length; i++)
{
  var hilight = hilights[i];
  
  var mediastring = '';
  var thumbstring = ''
  if (hilight[4]) // if there's an image
  {
    mediastring = '<img class="illustration" src="pictures/' + hilight[4] + '" alt="' + hilight[0] + '" />';
    thumbstring = '<img class="thumbnail" src="pictures/' + hilight[4] + '" alt="' + hilight[0] + '" />';
  }
  
  var markerHTML = '<div class="innerlabel">' + thumbstring + '<h3>' + hilight[0] + '</h3><div class="hContent">' + mediastring + hilight[3] + '</span></div>';
  
  hilightLayer.addLayer(new L.marker(
    hilight[1],
    {
      icon: L.divIcon({
        className: 'leaflet-label hilight-label leaflet-label-' + hilight[2],
        html: markerHTML,
        iconSize: ['auto', 'auto']
      })
    }
 // ).on("mouseover", function() {
 //   alert('hi');
 // }
 ));   
}

/*
hilightLayer.on('mouseover', function(e) {
  alert('abc');
});
*/

hilightLayer.addTo(map);

  

$(document).ready(function() {
  //$(document).delegate('div.hilight-label', 'mouseover', function() {
  $('div.hilight-label').mouseenter(function() {
  //$('#map').on('mouseenter', 'div.hilight-label', function() {
  //$('div.leaflet-marker-pane').on('mouseover', 'div.hilight-label', function() {
    //alert('yo');
    $('div.hContent').hide();
    $('img.thumbnail').show();
    $('div.hilight-label.expanded').removeClass('expanded');
    $(this).addClass('expanded');
    $(this).find('div.hContent').show();
    $(this).find('img.thumbnail').hide();
  });
  
  //$(document).delegate('div.hilight-label', 'mouseout', function() {
  $('div.hilight-label').mouseleave(function() {
  //$('#map').on('mouseleave', 'div.hilight-label', function() {
    $(this).find('div.hContent').hide();
    $(this).find('img.thumbnail').show();
    $(this).removeClass('expanded');
  }); 
});

// Event listners for markers.  This is ugly.  Should use jQuery's 'on'
// or 'delegate' instead, but mouseover events don't propagate up past
// div.leaflet-marker-pane for some reasons unknown to me.

// TODO

