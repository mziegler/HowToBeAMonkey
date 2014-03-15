var map = L.map('map').setView([10.5115, -85.367], 16);

      
// base map (satelite images)
L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  attribution: 'Satelite images courtesy of Google',
  maxZoom: 22,
  //opacity: 0.5,
}).addTo(map);


// add GPS track to map     
var polyline = L.polyline(WHtrack, {color: 'white'}).addTo(map);


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
  maxClusterRadius: 80,
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


// add or remove layers to the map based on the zoom level
function zoomHandle() {
  //alert(map.getZoom());
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
zoomHandle()
map.on('zoomend', zoomHandle);


// Event listners for markers.  This is ugly.  Should use jQuery's 'on'
// or 'delegate' instead, but mouseover events don't propagate up past
// div.leaflet-marker-pane for some reasons unknown to me.  This needs to
// be called every time the map is re-drawn.
function bindMouseListners()
{
  // raise marker on mouseover
  $('div.leaflet-label').mouseenter(function() {
    if (!$(this).attr('origZ'))
      {$(this).attr('origZ', $(this).css('z-index'));}
    $(this).css('z-index', 99999);
  });
  
  // lower marker on mouseout
  $('div.leaflet-label').mouseleave(function() {
    if ($(this).attr('origZ'))
      {$(this).css('z-index', $(this).attr('origZ'));}
  });
  
  // expand hilight markers on mouseover
  $('div.hilight-label').mouseenter(function() {
    $('div.hContent').hide();
    $('img.thumbnail').show();
    $('div.hilight-label.expanded').removeClass('expanded');
    $(this).addClass('expanded');
    $(this).find('div.hContent').show();
    $(this).find('img.thumbnail').hide();
  });
  
  // shrink hilight markers on mouseout
  $('div.hilight-label').mouseleave(function() {
    $(this).find('div.hContent').hide();
    $(this).find('img.thumbnail').show();
    $(this).removeClass('expanded');
  }); 
}

bindMouseListners();
map.on('moveend', bindMouseListners);

