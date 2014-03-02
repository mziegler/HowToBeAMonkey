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
    return "leaflet-label-left";
  else
    return "leaflet-label-right";
}


function clusterIcon(cluster) {
  var childrenToShow = 3;

  var children = cluster.getAllChildMarkers();
  
  var html = "<div class='cluster'><ul>";
  
  for (var i=0; i<childrenToShow; i++)
  {
    var markerHtml = children[i].options.icon.options.html;
    html = html + '<li>' + markerHtml + '</li>';
    
  }
  
  html = html + '</ul>';
  
  if (children.length > childrenToShow)
    html = html + ' and ' + (children.length - childrenToShow) + ' more.';
  
  html = html + '</div>';
  
  return L.divIcon({
    className: 'leaflet-label-cluster ' + alternateClass() + '-cluster',
    iconSize: ['auto', 'auto'],
    html: html,
  });
  
}


// cluster layer for behavior markers
var behaviors = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: false,
  //iconCreateFunction: clusterIcon,
  riseOnHover: true,
  });


// add behavior markers to map
for (var i = 0; i < behaviorPoints.length; i++)
{
  var row = behaviorPoints[i];
  
  behaviors.addLayer(new L.marker(
    [
      row[0],
      row[1]
    ], {
      icon: L.divIcon({
        className: 'leaflet-label ' + alternateClass(),
        html: '<div><b>' + row[2] + '</b> ' + row[3] + '</div>',
        iconSize: ['auto', 'auto']
      }),
    })
  );
}




behaviors.on('clusterclick', function(e) {
  e.target.setZIndexOffset(99999);
});

behaviors.on('clustermouseout', function(e) {
  e.target.setZIndexOffset(0);
});

map.addLayer(behaviors);
