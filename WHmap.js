( function() {

var initialView = [[10.5147, -85.3698], 19];

var map = L.map('map', {
  maxZoom:21, 
  zoomControl: false, 
  attributionControl: false,
  maxBounds: L.latLngBounds([10.525, -85.3605], [10.5065, -85.3745]),
}).setView(initialView[0], initialView[1]);


// base map (satelite images)
L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  maxZoom: 19,
  opacity: 1,
}).addTo(map);




var initialLineClipPadding = L.Path.CLIP_PADDING; // save old clip padding
var animationLineClipPadding = 3000; // clip padding for zoom/pan intro animations (avoid choppy line rendering)
L.Path.CLIP_PADDING = animationLineClipPadding; // don't clip the path for intro animation

// add GPS track to map     
var track = L.polyline(WHtrack, { 
    color: 'white', 
    opacity:1,
    weight:4, 
    lineJoin:'round', 
    lineCap:'round', 
    dashArray:[10,10]
  }).addTo(map);
 
L.Path.CLIP_PADDING = initialLineClipPadding; // restore old clip padding

///////////////////////////////////////////////////////////////////////////////
// HEADER LINKS

function toggleSidePanel(contentSelector) {
  if ($(contentSelector).is(':visible')) {
    closeSidePanel();
  }
  else {
    $('.side-panel-content').hide();
    $(contentSelector).fadeIn('fast');
    $('#side-panel').fadeIn('fast');
  }
}

function closeSidePanel() {
  $('#side-panel').fadeOut(150);
}

function resetView() {
  map.closePopup(); 
  map.setView(initialView[0], initialView[1], {animate: true});
  setTimeout(function() { startMarker.openPopup() }, 300);
  closeSidePanel();
}

$('#tab-about').click( function() { toggleSidePanel('#panel-about'); return false; });
$('#tab-help').click( function() { toggleSidePanel('#panel-help'); return false; });
$('#tab-biographies').click( function() { toggleSidePanel('#panel-biographies'); return false; });

// add paypal link when donate panel is opened
$('#tab-donate').click( function() {
  $('#paypall-wrapper:empty').html('Donate to the Capuchin Foundation via PayPal:<form id="paypal" action="https://www.paypal.com/cgi-bin/webscr" method="post" style="margin:15px 0 0 0;"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="MWBPPSVMGF3BY"><input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"><img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1"></form>');
  toggleSidePanel('#panel-donate'); return false; 
});

$('#tab-reset').click(resetView);

$('#close-side-panel').click(closeSidePanel);
$('#map *, #map').click(closeSidePanel);



///////////////////////////////////////////////////////////////////////////////
// MAP CONTROLS

// add layer control (to be populated with cluster layers)
var layerControl = L.control.groupedLayers(null, null, {position:'topleft'}).addTo(map);

// zoom control (underneath layer control)
L.control.zoom({ position: 'topleft' }).addTo(map);

L.control.scale().addTo(map); // scale control



///////////////////////////////////////////////////////////////////////////////
// BEHAVIOR POPUPS

function popupHTML(points) { 
  
  // sort points by time
  points.sort(function(a,b) {
    return a.data.time.localeCompare(b.data.time);
  });

  
  var category = points[0].data.category;
    
  var html = '<div class="popup-title popup-title-c' + category + '">' + categories[category].name + '</div><div class="behavior-list"><table>';
  
  for (var i = 0; i < points.length; i++) {    
    var ops = points[i].data;
    html += '<tr><td class="behavior-timestamp">' + ops.time + '</td><td class="behavior-point">' + ops.text + '</td></tr>';
  }
  
  html += "</table></div>";
  return html;
}  


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
      'minWidth':400, 
      'className':'behavior-popup',
      'offset':offset,
      'keepInView':false
    })
    .setContent(popupHTML(points))
    .setLatLng(target.getLatLng())
    .openOn(map);
  }
}



///////////////////////////////////////////////////////////////////////////////
// BEHAVIOR CLUSTER MARKERS
  
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
  return behaviorIcon(cluster._clusterMarkers[0].data.category, cluster.population);
}

// generates icons for behavior singletons
function singletonBehaviorIcon(data) {
  return behaviorIcon(data.category, 1);
}


// generate and return an icon for behavior clusters/singletons
function behaviorIcon(category, population) {
  // return invisible icons when zoomed out (hack - 
  // removing the layers woud mess up layer control)
  if (map.getZoom() <= 15) {
    return invisibleIcon;
  }
  
 
  // set icon size based on population (# child markers)
  var iconSize = [48, 48]; 
  if (population < 7) {
    iconSize = [32, 32];
  }

  // scatter anchor
  var anchorPoint = scatterAnchor([iconSize[0] / 2, iconSize[1] / 2], 200);
    
  var icon = L.icon({
    iconUrl: 'icons/48/' + category + '.png',
    iconSize: iconSize,
    iconAnchor: anchorPoint,
    className: 'behavior-icon',
  });
  
  // save offset to center popup over marker
  icon.popupOffset = [-anchorPoint[0] + iconSize[0]/2, -anchorPoint[1] + iconSize[1]/2 - 10];
    
  return icon;
}
  

// called to generate a marker for each behavior cluster
function buildClusterMarker(cluster, position) {
  var m = new L.Marker(position, {
    icon: clusterBehaviorIcon(cluster)
  });
  
  m.on('click', function(target) { 
    toggleBehaviorPopup(target.target, cluster._clusterMarkers); 
  });
  
  // remove popup when icon is removed
  m.on('remove', function(target) {
    if (target.target.behaviorPopup) {
      map.closePopup(target.target.behaviorPopup);
    }
  });
  
  return m;
};


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

PruneCluster.Cluster.ENABLE_MARKERS_LIST = true; // for pop-up generation


// loop over categories to add cluster layers and behavior markers
for (var category in behaviorPoints) {
  var points = behaviorPoints[category];
  var categoryInfo = categories[category];
  
  
  var clusterLayer = new PruneClusterForLeaflet(200);
  
  // disable spiderfy
  clusterLayer.spiderfier.Spiderfy = function(){return false;};
  
  
  clusterLayer.BuildLeafletClusterIcon = clusterBehaviorIcon;
  clusterLayer.BuildLeafletCluster = buildClusterMarker;
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

// free up some memory
behaviorPoints = null;


// populate legend
for (var i = 0; i < categoryOrder.length; i++) {
  var category = categoryOrder[i],
    categoryInfo = categories[category],
    layer = markerClusterLayers[category];
    
  layerControl.addOverlay(layer, '<img src="icons/48/' + category + '.png" class="legend-icon" /><span class="legend-label">' + categoryInfo.name + '</span>', categoryInfo.group);
}


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
    {className:'behavior-popup', maxWidth:400}).on('click', closeSidePanel)
  );
}
textBoxLayer.addTo(map);



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
          
          closeSidePanel();
        })
      })(picture) // call with current picture
      
    )
  );
}


pictureLayer.addTo(map);




///////////////////////////////////////////////////////////////////////////////
// START AND END POINTS


var startMarker = L.marker(WHtrack[0], {icon: L.icon({
        iconUrl: 'icons/awake.png',
        iconSize: [80,80],
        iconAnchor: [40,80],
        popupAnchor: [0,-70],
        /*shadowUrl: 'icons/awake-bedtime-shadow.png',
        shadowSize: [121,80],
        shadowAnchor: [40,80]*/
    })})
    .addTo(map)
    .bindPopup(startPopup, {'minWidth':410, 'className':'behavior-popup'})
    .on('click', closeSidePanel);
    
var endMarker = L.marker(WHtrack[WHtrack.length - 1], {icon: L.icon({
        iconUrl: 'icons/bedtime.png',
        iconSize: [80,80],
        iconAnchor: [40,80],
        popupAnchor: [0,-70],
        /*shadowUrl: 'icons/awake-bedtime-shadow.png',
        shadowSize: [121,80],
        shadowAnchor: [40,80]*/
    })})
    .addTo(map)
    .bindPopup(endPopup)
    .on('click', closeSidePanel);




///////////////////////////////////////////////////////////////////////////////
// INTRO SCREENS


// hide the overlay screen
function closeOverlay() {
  $('#overlay').fadeOut();
}

// hide overlay on background click
$('#overlay').click(closeOverlay);
$('.overlay-content').click(function() { return false }); // don't propagate click on content area


// when the 'next' button on the first intro screen gets clicked
$('#next-intro1').click(function() {


  L.Path.CLIP_PADDING = animationLineClipPadding; // don't clip the path for this animation

  closeOverlay();

  // pretty gnarly code chaining animation sequence
  
  L.DomUtil.addClass(map._mapPane, 'leaflet-zoom-anim-slow'); // hack to slow down zoom animation
  $('.leaflet-marker-pane, .leaflet-shadow-pane').fadeOut(1000);
  map.setView([10.51185, -85.369238], 16,
      {pan:{animate:true, duration:1500}, zoom:{animate:true}}  );
  window.setTimeout(function(){ L.DomUtil.removeClass(map._mapPane, 'leaflet-zoom-anim-slow'); }, 1000);

  window.setTimeout(function() {
    L.DomUtil.addClass(map._mapPane, 'leaflet-zoom-anim-slow');
    map.setView([10.51185, -85.369238], 18,
      {pan:{animate:true, duration:1500}, zoom:{animate:true}}  );
    window.setTimeout(function(){ L.DomUtil.removeClass(map._mapPane, 'leaflet-zoom-anim-slow'); }, 1000);
    window.setTimeout(function() {
        $('.leaflet-marker-pane, .leaflet-shadow-pane').fadeIn('slow');
        window.setTimeout(function() {
          $('.overlay-content').hide();
          $('#overlay-intro2').show();
          $('#overlay').fadeIn('slow');
          
          
          L.Path.CLIP_PADDING = initialLineClipPadding;  // restore old clip padding
        }, 500);
    }, 1600)
  }, 3000);
});


// when the 'next' button is clicked on the second intro screen
$('#next-intro2').click(function() {
  closeOverlay();
  
  L.Path.CLIP_PADDING = animationLineClipPadding; // don't clip the path for this animation
  
  map.panTo([10.5143646989, -85.3639992792], {animate:true, duration:1.5, easeLinearity:1});
  
  window.setTimeout(function() {
    map.panTo([10.5085, -85.3669639584], {animate:true, duration:1.5, easeLinearity:1})
  }, 2000);
  
  window.setTimeout(function() {
    map.panTo([10.5142232962, -85.3693762701], {animate:true, duration:1.5, easeLinearity:1})
  }, 4000);
  
  window.setTimeout(function() {
    startMarker.openPopup();
    L.Path.CLIP_PADDING = initialLineClipPadding;  // restore old clip padding
  }, 6000);
  
  
});




//////////////////////////////////////////////////////////////////////////////
// ZOOM
// add or remove layers to the map based on the zoom level
// cluster layer zoom behavior handled in clusterIconFactory function
function zoomHandle() {
  if (map.getZoom() <= 17) {
    map.removeLayer(pictureLayer);
    map.closePopup();
  }
  else {
    map.addLayer(pictureLayer);
  }
  
  
  if (map.getZoom() <= 16) {
    map.removeLayer(textBoxLayer);
  }
  else {
    map.addLayer(textBoxLayer);
  }
  
  
  if (map.getZoom() <= 14) {
    map.removeLayer(endMarker);
  }
  else {
    map.addLayer(endMarker);
  }
}
zoomHandle();
map.on('zoomend', zoomHandle);


})();
