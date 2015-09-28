// include "map" from map.js



function initMapMedia() {








///////////////////////////////////////////////////////////////////////////////
// BEHAVIOR POPUPS

function popupHTML(points) { 
    
  var category = points[0].data.category;
    
  var html = '<div class="popup-title popup-title-c' + category + '">' + categories[category].name + '</div><div class="behavior-list"><table><tbody class="behavior-points-initial">';
  
  // highest-ranking points
  points.sort(function(a,b) {
    return b.data.rank-a.data.rank;
  });

  var topPoints = [];
  var topPointsSet = {};
  for (var i = 0; i < points.length && topPoints.length < 4; i++) {
    if (!topPointsSet.hasOwnProperty(points[i].data.text)) {
      topPointsSet[points[i].data.text] = true;
      topPoints.push(points[i]);
    }
  }

  topPoints.sort(function(a,b) {  // sort by time
    return a.data.time.localeCompare(b.data.time);
  }); 
  
  for (var i = 0; i < topPoints.length; i++) {    
    var ops = topPoints[i].data;
    html += '<tr><td class="behavior-timestamp">' + ops.time + '</td><td class="behavior-point">' + ops.text + '</td></tr>';
  }
  
  
  // if we're not showing all the points, list all of the points for the cluster
  // in a hidden tbody and show 'see all points' link
  if (points.length > topPoints.length) {
    html += '</tbody><tbody class="behavior-points-hidden" style="display:none;">'
    
    // sort all points by time
    points.sort(function(a,b) {
      return a.data.time.localeCompare(b.data.time);
    });
    
    for (var i = 0; i < points.length; i++) {    
      var ops = points[i].data;
      html += '<tr><td class="behavior-timestamp">' + ops.time + '</td><td class="behavior-point">' + ops.text + '</td></tr>';
    }
    
    html += '</tbody></table></div><a class="show-all-points">(+) See all ' + points.length+ ' observations</a><a class="show-fewer-points" style="display:none">(-) See fewer observations</a>';
  }
  else {
    html += '</tbody></table></div>';
  }
  
  return html;
}  

// toggle short and long behavior point views for open popup
$('#map').delegate('a.show-all-points', 'click', function() {
  $('a.show-all-points').hide();
  $('a.show-fewer-points').show();
  $('table:visible tbody.behavior-points-hidden').show();
  $('tbody.behavior-points-initial:visible').hide();
});
$('#map').delegate('a.show-fewer-points', 'click', function() {
  $('a.show-fewer-points').hide();
  $('a.show-all-points').show();
  $('table:visible tbody.behavior-points-initial').show();
  $('tbody.behavior-points-hidden:visible').hide();
});

// toggle behavior popup when an icon is clicked
function toggleBehaviorPopup(target, points) {
  
  if (target.behaviorPopup) {
    
    // close the popup if it is open 
    if (map.hasLayer(target.behaviorPopup)) {
      map.closePopup(target.behaviorPopup);
    }
    
    // open the popup if it already exists but is closed
    else {
      target.behaviorPopup.openOn(map);
    }
  }
  
   
  // if the popup doesn't already exist, create it and open
  else {
    var offset = target.options.icon.popupOffset;

    // Not binding popup to icon because PruneCluster calls setLatLng on marker
    // all the time, won't let user pan away from popup.  Save a pointer to the
    // popup so we can remove it when the marker is removed.
    target.behaviorPopup = L.popup({
      minWidth: 400, 
      maxWidth: 400,
      fullWidth: 400,
      className: 'behavior-popup',
      offset: offset,
      keepInView: false
    })
    .setContent(popupHTML(points))
    .setLatLng(target.getLatLng())
    .openOn(map);
  }
}











///////////////////////////////////////////////////////////////////////////////
// BEHAVIOR CLUSTER MARKERS


(function() {
  // randomly scatter icon anchor about the default anchor
  function scatterAnchor(anchorCenter, range) {
    return [ (range / 2) - (Math.random() * range) + anchorCenter[0], 
             (range / 2) - (Math.random() * range) + anchorCenter[1]  ]; 
  }
    

  // used to hide icons without removing layers (to not mess up layer control)
  var invisibleIcon = L.icon({
    iconSize: [0,0],
    iconUrl: 'libraries/images/leaflet/quote.png',
  });


  // generates icons for behavior clusters
  function clusterBehaviorIcon(cluster) {
    return behaviorIcon(cluster.lastMarker.data.category, cluster.population);
  }

  // generates icons for behavior singletons
  function singletonBehaviorIcon(data) {
    return behaviorIcon(data.category, 1);
  }


  // generate and return an icon for behavior clusters/singletons
  function behaviorIcon(category, population) {
    // return invisible icons when zoomed out (hack - 
    // removing the layers woud mess up layer control)
    if (map.getZoom() <= 16) {
      return invisibleIcon;
    }
    
   
    // set icon size based on population (# child markers)
    var iconSize = [48, 48]; 
    if (population < 7 || category=='W' || category=='A' || category=='O') {
      iconSize = [32, 32];
    }

    // scatter anchor
    var anchorPoint = scatterAnchor([iconSize[0] / 2, iconSize[1] / 2], 250);
      
    var icon = L.icon({
      iconUrl: 'icons/48/' + category + '.png',
      iconSize: iconSize,
      iconAnchor: anchorPoint,
      className: 'behavior-icon',
      shadowUrl: 'icons/48/shadow.png',
      shadowSize: [Math.floor(iconSize[0]*1.52), iconSize[1]],
      shadowAnchor: anchorPoint
    });
    
    // save offset to center popup over marker
    icon.popupOffset = [-anchorPoint[0] + iconSize[0]/2, -anchorPoint[1] + iconSize[1]/2 - 10];
      
    return icon;
  }
    

  function buildClusterMarkerFactory(clusterLayer) {
    // called to generate a marker for each behavior cluster
    function buildClusterMarker(cluster, position) {
      var m = new L.Marker(position, {
        icon: clusterBehaviorIcon(cluster)
      });
      
      m.on('click', function(target) { 
        toggleBehaviorPopup(target.target, clusterLayer.Cluster.FindMarkersInArea(cluster.bounds)); 
      });
      
      // remove popup when icon is removed
      m.on('remove', function(target) {
        if (target.target.behaviorPopup) {
          map.closePopup(target.target.behaviorPopup);
        }
      });
      
      return m;
    }
    return buildClusterMarker;
  }


  // bind events to singleton markers
  function prepareSingletonMarker(leafletMarker, data) {
    leafletMarker.setIcon(behaviorIcon(data.category, 1));
    
    leafletMarker.on('click', function(target) { 
      toggleBehaviorPopup(target.target, [{'data':data}]); 
    });
    
    // remove popup when icon is removed
    leafletMarker.on('remove', function(target) {
      if (target.target.behaviorPopup) {
        map.closePopup(target.target.behaviorPopup);
      }
    });
    
  } 


  var markerClusterLayers = {}; // keep cluster layers for legend

  //PruneCluster.Cluster.ENABLE_MARKERS_LIST = true; // for pop-up generation


  // asynchronously fetch behavior data points because they're big
  $.getJSON('behavior.js')
  .done(function(behaviorPoints) {
    // loop over categories to add cluster layers and behavior markers
    for (var category in behaviorPoints) {
      var points = behaviorPoints[category];
      var categoryInfo = categories[category];
      
      
      var clusterLayer = new PruneClusterForLeaflet(categoryInfo.clustersize);
      
      // disable spiderfy
      clusterLayer.spiderfier.Spiderfy = function(){return false;};
      
      
      clusterLayer.BuildLeafletClusterIcon = clusterBehaviorIcon;
      clusterLayer.BuildLeafletCluster = buildClusterMarkerFactory(clusterLayer);
      clusterLayer.PrepareLeafletMarker = prepareSingletonMarker;


      // add markers to cluster layer
      for (var i = 0; i < points.length; i++) {
        var row = points[i];
        
        var marker = new PruneCluster.Marker(row[0], row[1]);
        marker.data = { 
            time: row[2],
            rank: row[4],
            category: row[5],
            text: row[3],
            icon: singletonBehaviorIcon
        }
        clusterLayer.RegisterMarker(marker);
      }
      
      markerClusterLayers[category] = clusterLayer;
      
      // add default category layers to map
      if (categoryInfo.default)  { map.addLayer(clusterLayer); } 
      
    }

  });
});//();




///////////////////////////////////////////////////////////////////////////////
// TEXT BOX LAYER
var textBoxLayer = L.layerGroup();


for (var i = 0; i < textBoxes.length; i++) {  
  var textBoxIcon = L.divIcon({
    className: 'textbox-icon',
    html: '<span class="textbox-icon-inner">' + textBoxes[i][1] + '</span>',
    iconAnchor: [textBoxes[i][3][0], textBoxes[i][3][1]],
    popupAnchor:  [-textBoxes[i][3][0], -textBoxes[i][3][1]]
  })

  textBoxLayer.addLayer(
    L.marker(textBoxes[i][0], {icon:textBoxIcon}).bindPopup(
      '<div class="popup-title">' +
      textBoxes[i][1] +
      '</div><div class="caption">' +
      textBoxes[i][2] + 
      '</div>', 
      {
        className:'behavior-popup texbox-popup', 
        maxWidth:500,
        minWidth:500,
        fullWidth: 500
      }
    ).on('click', function(){ headerControls.closeSidePanel() })
  );
}
//textBoxLayer.addTo(map);



///////////////////////////////////////////////////////////////////////////////
// PICTURE LAYER


var pictureLayer = L.layerGroup();

for (var i = 0; i < pictures.length; i++) {
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
            .attr('data-lightbox', 'pictureLayer-' + i)
            .attr('data-title', picture[2])
            .click();
          
          headerControls.closeSidePanel();
        })
      })(picture) // call with current picture
      
    )
  );
}


//pictureLayer.addTo(map);




///////////////////////////////////////////////////////////////////////////////
// START AND END POINTS


var startMarker = L.marker(WHtrack[0], {icon: L.icon({
        iconUrl: 'icons/awake.png',
        iconSize: [80,80],
        iconAnchor: [40,80],
        popupAnchor: [0,-70],
        shadowUrl: 'icons/awake-bedtime-shadow.png',
        shadowSize: [121,80],
        shadowAnchor: [40,80],
        className: 'awake-bedtime-icon'
    })})
    //.addTo(map)
    .bindPopup(startPopup, {
      minWidth: 500, 
      maxWidth: 500,
      fullWidth: 500,
      className: 'behavior-popup'
    })
    .on('click', function(){ headerControls.closeSidePanel() });
    
var endMarker = L.marker(WHtrack[WHtrack.length - 1], {icon: L.icon({
        iconUrl: 'icons/bedtime.png',
        iconSize: [80,80],
        iconAnchor: [40,80],
        popupAnchor: [0,-70],
        shadowUrl: 'icons/awake-bedtime-shadow.png',
        shadowSize: [121,80],
        shadowAnchor: [40,80],
        className: 'awake-bedtime-icon'
    })})
    //.addTo(map)
    .bindPopup(endPopup, {
      minWidth: 500, 
      maxWidth: 500,
      fullWidth: 500,
      className: 'behavior-popup'
    })
    .on('click', function(){ headerControls.closeSidePanel() });
    









return {

    }
}

var mapMedia = initMapMedia();


