var map = L.map('map').setView([10.512, -85.366], 16);
      
// base map (satelite images)
L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  attribution: 'Satelite images courtesy of Google',
  maxZoom: 19
}).addTo(map);

// add GPS track      
var polyline = L.polyline(WHtrack, {color: 'blue'}).addTo(map);

/*L.marker(
    [10.512, -85.366], {
      icon: L.divIcon({
        className: 'leaflet-label leaflet-label-right',
        html: '<b>Yo</b> hi what\'s going on',
        iconSize: ['auto','auto']
      })
    }).addTo(map);*/

// plot behavior markers

for (var i = 0; i < behaviorPoints.length; i++)
{
  var row = behaviorPoints[i];
  
  L.marker(
    [
      row[0],
      row[1]
    ], {
      icon: L.divIcon({
        className: 'leaflet-label leaflet-label-right',
        html: '<b>' + row[2] + '</b> ' + row[3],
        iconSize: ['auto', 'auto']
      }),
      riseOnHover: true,
    }).addTo(map);
}

