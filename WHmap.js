var map = L.map('map', {maxZoom:26}).setView([10.5115, -85.367], 16);


// base map (satelite images)
L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  attribution: 'Satelite images courtesy of Google',
  maxZoom: 19,
  //opacity: 0.5,
}).addTo(map);


// add GPS track to map     
var polyline = L.polyline(WHtrack, {color: 'white'}).addTo(map);




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
function clusterIcon(cluster) {
  var childrenToShow = 8;

  var children = cluster.getAllChildMarkers();
  
  var startIndex = (childrenToShow >= children.length) ? 0 
    : Math.floor((Math.random()*(children.length - childrenToShow)));
  
  var html = '<div class="innerlabel">';
  
  for (var i=0; i<childrenToShow && i<children.length; i++)
  {
    var markerHtml = children[startIndex + i].options.icon.options.html;
    html = html + markerHtml.substring(40, markerHtml.length-6);
  }
  
  //if (children.length > childrenToShow)
  //  html = html + ' and ' + (children.length - childrenToShow) + ' more.';
  
  html = html + '</div>';
  
  return L.divIcon({
    className: 'cluster-label leaflet-label ' + alternateClass(),
    iconSize: ['auto', 'auto'],
    html: html,
  });
  
}


// cluster layer for behavior markers
var behaviorLayer = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: false,
  iconCreateFunction: clusterIcon,
  showCoverageOnHover: false,
  maxClusterRadius: 150,
  zoomToBoundsOnClick: false,
  });


// add behavior markers to cluster layer
for (var i = 0; i < behaviorPoints.length; i++)
{
  var row = behaviorPoints[i];
  
  behaviorLayer.addLayer(new L.marker(
    [
      row[0],
      row[1]
    ], {
      icon: L.divIcon({
        className: 'leaflet-label point-label ' + alternateClass(),
        html: '<div class="innerlabel"><b>' + row[2] + '</b> <div class="clusterpoint r' + row[4] + '">' + row[3] + '</div></div>',
        iconSize: ['auto', 'auto']
      }),
    })
  );
}


//map.addLayer(behaviorLayer);




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
// MAP MOUSE EVENT HANDLERS

// add or remove layers to the map based on the zoom level
function zoomHandle() {

  lowerMarkers();
  shrinkHilights();

  if (map.getZoom() > 17)
  {
    map.removeLayer(hilightLayer);
    map.addLayer(behaviorLayer);
  }
 /* else if (map.getZoom() == 17)
  {
    map.addLayer(behaviorLayer);
    map.addLayer(hilightLayer);
  } */
  else
  {
    map.removeLayer(behaviorLayer);
    //if (!map.hasLayer(hilightLayer))
    map.addLayer(hilightLayer);
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
