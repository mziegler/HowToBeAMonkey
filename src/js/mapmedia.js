// include "map" from map.js




function initMapMedia() {
    
    
    var clusterDiameter = 300;
    var clusterMargin = 50;
    
    
    
    
    function buildClusterMarker(cluster, position) {
      var m = new L.Marker(position, {
        icon: buildLeafletClusterIcon(cluster)
      });
      
      
      m.on('add', function(e) {
        //bubbleSVG(d3.select('.' + m.options.icon.uniqueClass));
        
        //console.log(m.options.icon.uniqueClass);
        //console.log(d3.select('.' + m.options.icon.uniqueClass));
      });      
      
      m.on('click', function(e) { 
        // TODO 
      });
      
      // remove popup when icon is removed
      m.on('remove', function(e) {
        // TODO
        if (e.target.behaviorPopup) {
          map.closePopup(e.target.behaviorPopup);
        }
      });
      
      return m;
    }
    
    
    
    
    // generate unique cluster-icon class names
    var uniqueClassNumber = 0;
    function uniqueClassGenerator() {
        uniqueClassNumber += 1;
        return 'bubble' + uniqueClassNumber;
    }
    
    
    
    // hack to draw SVG in the icon after a pause, after which the icon should
    // have been rendered onto the map so we can select its DOM element
    function updateClusterIcon(cluster, uniqueClass, i) {
    
        // give up after 10 trys
        if (i === undefined) { i = 0; }
        if (i > 10) { return; }
        
        var selection = d3.select('.'+uniqueClass);
        if (selection.length) {
            bubbleSVG(cluster, selection);
        }
        else {
            setTimeout( function(){ updateClusterIcon(cluster, uniqueClass, i+1); }, 3);
        }
    }
    
    
    
    function buildLeafletClusterIcon(cluster) {
    
      
        var uniqueClass = uniqueClassGenerator();
    
        var icon = L.divIcon({
            iconSize: [clusterDiameter, clusterDiameter],
            iconAnchor: [clusterDiameter/2, clusterDiameter/2],
            // popupAnchor: ???,
            className: 'leaflet-cluster-icon ' + uniqueClass,
            html: '',
        });
        
        icon.uniqueClass = uniqueClass;
        
        setTimeout( function(){ updateClusterIcon(cluster, uniqueClass); }, 2);
        
        return icon;
    }
    
    
    
    
    
    function bubbleCount(clusterMarkers) {
        // _clusterMarkers
    
        var bubbles = {};
    
        $.each(clusterMarkers
    
    }
    
    
    
    
    
    // Draw the cluster SVG inside the given D3 selection.
    function bubbleSVG(cluster, containerSelection) {
    
    
    
        var playdata = {children: [
         {color: 'yellowgreen', value: 200},
         {color: 'yellowgreen', value: 200},
         {color: 'yellowgreen', value: 200},
         {color: 'lightblue', value: 200},
         {color: 'lightblue', value: 200},
         {color: 'lightblue', value: 200},
         {color: 'orange', value: 200},
         {color: 'orange', value: 200},
         {color: 'orange', value: 200},
         {color: 'yellow', value: 200},
         {color: 'yellow', value: 200},
        ]};
        
        var bubble = d3.layout.pack()
            //.sort(null)
            .size([clusterDiameter, clusterDiameter])
            .padding(10);
            
        var svg = containerSelection.append("svg")
            .attr('class', 'bubbles')
            .attr("width", clusterDiameter+"px")
            .attr("height", clusterDiameter+"px");
            
            
        var node = svg.selectAll(".node")
            .data(bubble.nodes(playdata)
                .filter(function(d) { return !d.children; }))
          .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { 
                return "translate(" + d.x + "," + d.y + ")"; 
            });

        
        node.append("circle")
            .attr("r", function(d) { return d.r; })
            .attr("fill", function(d) { return d.color; });
        
        
        return svg;

    }
    
    
    
    
    
    // create a cluster layer, but don't add it to the map yet
    function ClusterLayer() {
    
        PruneCluster.Cluster.ENABLE_MARKERS_LIST = true;
    
        var clusterLayer = new PruneClusterForLeaflet(400);
        
        // disable spiderfy via monkey-patch
        clusterLayer.spiderfier.Spiderfy = function(){return false;};
        
        
        clusterLayer.BuildLeafletClusterIcon = buildLeafletClusterIcon;
        clusterLayer.BuildLeafletCluster = buildClusterMarker;
        //clusterLayer.PrepareLeafletMarker = prepareSingletonMarker;
        
        
        return clusterLayer;
    }
    

    
    
    function loadBubbleMedia(media, behavior) {
        var clusterLayer = ClusterLayer();
        
        
        // load behavior points
        $.each(behavior.behavior, function(i, observation) {
            var marker = new PruneCluster.Marker(observation.loc[0], observation.loc[1]);
            marker.data = {
                type: 'behavior',
                time: observation['time'],
                rank: observation['rank'],
                category: observation['cat'],
                text: observation['text'],
            }
            clusterLayer.RegisterMarker(marker);
        });
        
        
        
        // load pictures
        $.each(media.pictures, function(i, picture) {
            var marker = new PruneCluster.Marker(picture.loc[0], picture.loc[1]);
            marker.data = {
                type: 'picture',
                uri: picture['uri'],
                caption: picture['cap'],
            }
            clusterLayer.RegisterMarker(marker);
        });
        
        
        
        // load text bubbles
        $.each(media.textbubbles, function(i, textbubble) {
            var marker = new PruneCluster.Marker(textbubble.loc[0], textbubble.loc[1]);
            marker.data = {
                type: 'text',
                title: textbubble['title'],
                text: textbubble['text'],
            }
            clusterLayer.RegisterMarker(marker);
            
        
        });
        
        
        map.map.addLayer(clusterLayer);
        
        return clusterLayer;
    }
    
    
    
    
    
    // load behavior points
    $.getJSON('behavior.json')
    .done( function(behavior) {
        loadBubbleMedia(media, behavior);
    });
    

    




    return {

    }
}




var mapMedia = initMapMedia();


