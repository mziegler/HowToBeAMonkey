// include "map" from map.js




function initMapMedia() {
    
    
    var clusterDiameter = 300;
    var clusterMargin = 50;
    
    var hexBinBounds = [new L.LatLng(10.516, -85.3745), new L.LatLng(10.5075, -85.3605)];
    
    
    
    
    var HexBinLayer = L.Class.extend({
        
        initialize: function() {
            
        
            this._layout = d3.hexbin()
                .radius((clusterDiameter+clusterMargin)/2)
                .x(function(d) { 
                    return map.map.latLngToLayerPoint(new L.LatLng(d.loc[0], d.loc[1])).x 
                })
                .y(function(d) { 
                    return map.map.latLngToLayerPoint(new L.LatLng(d.loc[0], d.loc[1])).y 
                });
            
            // Markers to be clustered
            this._markers = [];
            
            
            // Zoom level currently rendered on the map
            this._renderedZoom = -1;
            
            
            // SVG with icons, needs to be resized + re-positioned with each zoom.
            this._SVG = null;
            
            
            // 
            this._G = null;
            
        },
        
        
        RegisterMarker: function(marker) {
            this._markers.push(marker);
        },
        
        
        
        onAdd: function(map) {
            this._map = map;
            
            
            if (this._SVG) {
                d3.select(this._map.getPanes().overlayPane)
            }
            
            // create a DOM element and put it into one of the map panes
            this._SVG = d3.select(this._map.getPanes().overlayPane)
                .append('SVG')
                .attr('class', 'hexbin-layer leaflet-zoom-hide');
            
            
            this._G = this._SVG.append('G')
                      .attr('class', 'hexbin-zoom-layer');
                    
            
            
            // add a viewreset event listener for updating layer's position, do the latter
            map.on('moveend', this._moveend, this);
            this._moveend();
        },
        
        
        
        
        onRemove: function (map) {
            // remove layer's DOM elements and listeners
            map.getPanes().overlayPane.removeChild(this._SVG);
            map.off('moveend', this._moveend, this);
        },
        
        

        
        
        
        
        _createHexBins: function(G, width, height) {
            var hex_centers = G.selectAll('circle') //g.hex-enter')
                .data((
                    this._layout
                    .size([width,height]))(this._markers))
                .enter()/*
                .append('g')
                .attr('class', 'hex-center')
                .attr('transform', function(d){ return 'translate(' + d.x + ',' + d.y + ')'; });
            
            hex_centers*/
            .append('circle')
                .attr('cx', function(d) { return d.x })//0)
                .attr('cy', function(d) { return d.y })//0)
                .attr('r', 25)
                .attr('fill', 'orange');    
                
        },
        
        
        
        
        _moveend: function() {
            if (!this._map) { return; }



            // Update SVG bounds
            var topLeft = this._map.latLngToLayerPoint(hexBinBounds[0]);
            var bottomRight = this._map.latLngToLayerPoint(hexBinBounds[1]);
            this._SVG 
                .attr("width", bottomRight.x - topLeft.x)
                .attr("height", bottomRight.y - topLeft.y)
                .style("left", topLeft.x + "px")
                .style("top", topLeft.y + "px");
                
                
                this._G.attr({
                    'transform': 'translate(' + -topLeft.x + ',' + -topLeft.y + ')'
                });    
                    
                    
                    
            // DEBUG
            var p = this._map.latLngToLayerPoint(new L.LatLng(media.WHtrack[0], media.WHtrack[1]));
            this._G.append('circle')
            .attr({
                'fill': 'blue',
                'cx': p.x,
                'cy': p.y,
                'r': 50,
                'id': 'test',
            });
                    
                    
                    
                    
            // CREATE CLUSTER MARKERS
            // this._createHexBins(G, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
                


            // DRAW ICONS FOR VISIBLE CLUSTER MARKERS
        },
        
        
        
    });   

    
    
    
    
    
    
    /*
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
    */
    
    
    
    // generate unique cluster-icon class names
    var uniqueIDCounter = 0;
    function uniqueIDGenerator() {
        uniqueIDCounter += 1;
        return 'WH-auto-' + uniqueIDCounter;
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
    
    
    
    
    // Called to create the Leaflet icon for the cluster, but doesn't actually
    // draw the SVG bubbles yet.
    function buildLeafletClusterIcon(cluster) {
    
      
        var uniqueClass = uniqueIDGenerator();
    
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
    
    
    
    
    
    
    // Figure out which SVG bubbles to draw (and how big, in which order),
    // based on the markers in this cluster.
    function sortBubbles(clusterMarkers) {
    
        var bubbleGroups = {
            picture: [],
            video: [], // TO DO
            text: [],
            behavior: {},
        };
    
        $.each(clusterMarkers, function(i, marker) {
            observation = marker.data
            
            switch(observation.type) {
            
                case 'picture':
                    bubbleGroups.picture.push(observation);
                    break;
                    
                case 'text':
                    bubbleGroups.text.push(observation);
                    break;
                    
                case 'behavior':
                    if (!(observation.category in bubbleGroups.behavior)) {
                        bubbleGroups.behavior[observation.category] = [];    
                    }
                    bubbleGroups.behavior[observation.category].push(observation);
                    break;

                    
            }
        });
        
        
        
        
        // just randomly sort bubbles (for now)
        var sortedBubbles = [];
        function insertRandom(list) {
            var randomIndex = Math.floor(Math.random() * list.length);
            
            $.each(list, function(i, item) {
                sortedBubbles.splice(randomIndex, 0, item);
            });
        }
        
        
        
        // randomly all bubbles into the list
        $.each(bubbleGroups.behavior, function(cat, observations) {
            insertRandom([{
                value: 100,
                type: 'behaviorGroup',
                observations: observations,
                cat: cat,
            }]);
        });
        $.each(bubbleGroups.picture, function(i, item) {
            item.value=250;
            insertRandom([item]);
        });
        $.each(bubbleGroups.text, function(i, item) {
            item.value=300;
            insertRandom([item]);
        });
        
        
        
        
        
        
        return sortedBubbles;
    
    
    }
    
    
    
    
    
    // "this" is SVG "G" DOM element
    function renderBubbleIcon(bubbleData, G, clipPath) {
        
        clipPath.append("circle")
            .attr('cx', bubbleData.r)
            .attr('cy', bubbleData.r)
            .attr('r', bubbleData.r);
            
        G.attr('width', 2*bubbleData.r)
            .attr('height', 2*bubbleData.r);
            
        switch(bubbleData.type) {
            case 'text':
                G.append('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', 2*bubbleData.r)
                    .attr('height', 2*bubbleData.r)
                    .attr('fill', 'rgba(0,0,0,0.7)');
                G.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', bubbleData.r)
                    .attr('y', bubbleData.r)
                    .attr('fill', 'white')
                    .text(bubbleData.title);
                break;
                
                
            case 'picture':
                G.append('image')
                    .attr('x', '0')
                    .attr('y', '0')
                    .attr('width', 2*bubbleData.r)
                    .attr('height', 2*bubbleData.r)
                    .attr('xlink:href', 'pictures/thumbnails/' + bubbleData.uri)
                    .attr('preserveAspectRatio', 'xMidYMid slice');
                break;
                
            
            case 'behaviorGroup':
                
                G.append('image')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', 2*bubbleData.r)
                    .attr('height', 2*bubbleData.r)
                    .attr('xlink:href', 'icons/48/' + bubbleData.cat + '.png' )
                    .attr('preserveAspectRatio', 'xMidYMid slice');
                break;
        }
    
        
    }
    
    
    
    
    
    
    // Draw the cluster SVG inside the given D3 selection.
    function bubbleSVG(cluster, containerSelection) {
    
    
        var bubbleData = sortBubbles(cluster);
  
        
        var bubble = d3.layout.pack()
            //.sort(null)
            .size([clusterDiameter, clusterDiameter])
            .padding(10);
            
        var svg = containerSelection.append("svg")
            .attr('class', 'bubbles')
            .attr("width", clusterDiameter+"px")
            .attr("height", clusterDiameter+"px");
            
            
        var node = svg.selectAll(".node")
            .data(bubble.nodes({children: bubbleData})
                .filter(function(d) { return !d.children; }))
          .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { 
                return "translate(" + d.x + "," + d.y + ")"; 
            });
            
       
       
        node.each(function(bubbleData, i) {
            var thisNode = d3.select(this);
            
            var clipID = uniqueIDGenerator();
            
            var clipPath = thisNode.append('clipPath')
                .attr('id', clipID);
            
            var G = thisNode.append("g")
                .attr('width', 2*bubbleData)
                .attr('height', 2*bubbleData)
                .attr('transform', 'translate(-' + bubbleData.r + ',-' + bubbleData.r + ')')
                .attr('clip-path', 'url(#' + clipID + ')');
                            
            renderBubbleIcon(bubbleData, G, clipPath)
        });
        
        
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
        var clusterLayer = new HexBinLayer();
        
        
        // load behavior points
        $.each(behavior.behavior, function(i, observation) {
            var marker = {
                loc: observation.loc,
                type: 'behavior',
                time: observation.time,
                rank: observation.rank,
                category: observation.cat,
                text: observation.text,
            }
            clusterLayer.RegisterMarker(marker);
        });
        
        
        
        // load pictures
        $.each(media.pictures, function(i, picture) {
            var marker = {
                loc: picture.loc,
                type: 'picture',
                uri: picture.uri,
                caption: picture.cap,
            }
            clusterLayer.RegisterMarker(marker);
        });
        
        
        
        // load text bubbles
        $.each(media.textbubbles, function(i, textbubble) {
            var marker = {
                loc: textbubble.loc,
                type: 'text',
                title: textbubble.title,
                text: textbubble.text,
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


