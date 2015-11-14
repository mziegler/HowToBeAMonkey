// include "map" from map.js




function initMapBubbles() {
    
    
    var clusterDiameter = 300;
    var clusterMargin = 50;
    
    
    // Range over which to show icons
    // var zoomRange = {min: ??, max: ??};
    
    
    // Bounding box in which to compute the hex layout
    var hexBinBounds = {
            top: 10.516,
            bottom: 10.5075,
            left: -85.3745,
            right: -85.3605,
        };
        
    

    
    
    
    // Hex layer used to arrange icon clusters on the map
    var HexBinLayer = L.Class.extend({
        
        
        initialize: function() {
        
            this._layout = d3.hexbin()
                
                // convert points to a coordinate system with positive numbers and origin at 0,0
                .x(function(d) { 
                    return d.loc[1] - hexBinBounds.left;
                })
                
                .y(function(d) { 
                    return d.loc[0] - hexBinBounds.top;
                })
                
                // area over which to compute hex layout
                .size([hexBinBounds.right - hexBinBounds.left,
                    hexBinBounds.top - hexBinBounds.bottom]);
                
                
            
            // Markers to be clustered
            this._markers = [];
            
            
            // Zoom level currently rendered on the map
            this._renderedZoom = -1;
            
            
            // DIV element with hex layer, needs to be resized + re-positioned with each zoom.
            this._el = null;
            

        },
        
        
        
        
        
        registerMarker: function(marker) {
            this._markers.push(marker);
        },
        
        
        
        
        
        
        onAdd: function(map) {
            this._map = map;
            
            
            
            // create a DOM element and put it into one of the map panes
            this._el = d3.select(this._map.getPanes().overlayPane)
                .append('div')
                .attr('class', 'hexbin-layer leaflet-zoom-hide');
            
            
            
            // add a viewreset event listener for updating hex bins
            map.on('moveend', this._moveend, this);
            map.on('viewreset', this._reset, this);
            this._reset();
        },
        
        
        
        
        onRemove: function (map) {
            // remove layer's DOM elements and listeners
            map.getPanes().overlayPane.removeChild(this._el);
            map.off('moveend', this._moveend, this);
            map.off('viewreset', this._reset, this);
        },
        
        


        
        _reset: function() {
            this._createHexClusters();
        },
        
        
        
        
        _moveend: function() {
       
            var map = this._map;
       
            // loop over clusters
            this._el.selectAll('div.hexcluster').each(function(clusterdata, i) {
                
                if (
                    // does this cluster not have bubble icons yet? 
                    d3.select(this).select('svg').empty()
                    
                        &&
                    
                    // is this cluster within the visible bounds of the map?
                    map.getBounds().contains([clusterdata.y + hexBinBounds.top, clusterdata.x + hexBinBounds.left])
                ) {
                    
                    // render bubble icons for this cluster
                    bubbleSVG(clusterdata, d3.select(this));
                    
                }
                
            });      
           
        },
        
        
        
        
        _createHexClusters: function() {
        
            // clear out old clusters
            this._el.selectAll('div.hexcluster').remove();
        
        
            // hack so we can access the map in D3 accessor functions
            var map = this._map;
            
            
            // set bin radius, convert width from layer points to latLng space
            var r = (
                map.layerPointToLatLng(L.point(clusterDiameter + clusterMargin, 0)).lng
                - map.layerPointToLatLng(L.point(0, 0)).lng
                ) / 2;
            
            this._layout.radius(r);
                
            
        
            var hex_centers = this._el.selectAll('div.hexcluster') //g.hex-enter')
                .data(this._layout(this._markers))
                .enter()
                .append('div')
                .attr('class', 'hexcluster')
                .style({
                
                    position: 'absolute',
                    
                    // convert from hexcluster space to layer point space
                    left: function(d) { 
                        return (map.latLngToLayerPoint([0, d.x + hexBinBounds.left]).x - clusterDiameter/2) + 'px';
                    },
                    
                    top: function(d) { 
                        return (map.latLngToLayerPoint([d.y + hexBinBounds.top, 0]).y - clusterDiameter/2) + 'px';
                    },
                    
                    width: clusterDiameter + 'px',
                    height: clusterDiameter + 'px',
                });
            
  
                
        },
        
        

        
        
    });   

    
    
    
    
    
    
    
    
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
    
    
    
    
    
    
    
    // Figure out which SVG bubbles to draw (and how big, in which order),
    // based on the markers in this cluster.
    function sortBubbles(clusterMarkers) {
    
        var bubbleGroups = {
            picture: [],
            video: [], // TO DO
            text: [],
            behavior: {},
        };
    
        $.each(clusterMarkers, function(i, observation) {
            
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
            var randomIndex = Math.floor(Math.random() * sortedBubbles.length);
            
            $.each(list, function(i, item) {
                sortedBubbles.splice(randomIndex, 0, item);
            });
        }
        
        
        
        // randomly all bubbles into the list
        $.each(bubbleGroups.behavior, function(cat, observations) {
            insertRandom([{
                value: 25,
                type: 'behaviorGroup',
                observations: observations,
                cat: cat,
            }]);
        });
        
        
        
        
        // randomly insert pictures
        $.each(bubbleGroups.picture, function(i, item) {
            item.value= Math.random() * 50 + 50;
            insertRandom([item]);
        });
        
        
        
        //
        $.each(bubbleGroups.text, function(i, item) {
            item.value= Math.random() * 30 + 80;
            insertRandom([item]);
        });
        
        
        

        
        
        
        
        
        return sortedBubbles;
    
    
    }
    
    
    
    
    
    // Split text into new lines at every occurrance of "\n", and scale the
    // text to fit the specified width.
    // "Container" is a D3 selection.
    //
    // Return a D3 selection with the text.
    function renderText(text, r, padding, container) {
        var el = container.append('text')
            .attr('text-anchor', 'middle');
        
        var width = (r - padding) * 2;
        
        // loop over lines
        $.each(text.split('\\n'), function(i, line) {
            el.append('tspan')
                .attr({
                    x: 0, 
                    dy: i==0 ? 0 : '1.2em',
                    'text-anchor': 'middle',
                })
                .text(line);
        });
        
        
        
        // if the text is too big to fit in the box, scale it down
        var bb = el[0][0].getBBox();
        if (bb.width > width || bb.height > width) {
            var widthTransform = width / bb.width;
            var heightTransform = width / bb.height;
            var scale = widthTransform < heightTransform ? widthTransform : heightTransform;
        }
        else {
            var scale = 1;
        }
        
        
        el.attr('transform', 'translate(' + r + ',' + r + ') scale(' + scale + ')');

        return el;
    }
    
    
    
    
    
    
    // "this" is SVG "G" DOM element
    function renderBubbleIcon(bubbleData, r, G, clipPath) {
        
        
        clipPath.append("circle")
            .attr('cx', r)
            .attr('cy', r)
            .attr('r', r);
            
        G.attr('width', 2*r)
            .attr('height', 2*r);
            
        switch(bubbleData.type) {
            case 'text':
                G.append('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width',  2*r)
                    .attr('height', 2*r)
                    .attr('fill', 'rgba(0,0,0,0.5)');
                    
                renderText(bubbleData.title, r, 10, G)
                    .attr('fill', 'white');

                G.on('click', function(d, i) {
                    mapMedia.openTextPopup(d, this);
                    d3.event.stopPropagation();
                });
                break;
                
                
            case 'picture':
                G.append('image')
                    .attr('x', '0')
                    .attr('y', '0')
                    .attr('width', 2*r)
                    .attr('height', 2*r)
                    .attr('xlink:href', 'pictures/thumbnails/' + bubbleData.uri)
                    .attr('preserveAspectRatio', 'xMidYMid slice');
                G.on('click', function(d, i) {
                    mapMedia.openPicture(d, this);
                    d3.event.stopPropagation();
                });
                break;
                
            
            case 'behaviorGroup':
                
                G.append('image')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', 2*r)
                    .attr('height', 2*r)
                    .attr('xlink:href', 'icons/48/' + bubbleData.cat + '.png' )
                    .attr('preserveAspectRatio', 'xMidYMid slice');
                G.on('click', function(d, i) {
                    mapMedia.openBehaviorPopup(d, this);
                    d3.event.stopPropagation();
                });
                break;
        }
        
        

    
        
    }
    
    
    
    
    
    
    // Draw the cluster SVG inside the given D3 selection.
    function bubbleSVG(clusterdata, containerSelection) {
    
    
        var bubbleData = sortBubbles(clusterdata);
  
        
        var bubble = d3.layout.pack()
            .sort(null)
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
            
            // bubbleData.r is computed by the layout algorithm, value is assigned by us
            var r = Math.min(bubbleData.r, bubbleData.value); 
            
            var G = thisNode.append("g")
                .attr('width', 2*r)
                .attr('height', 2*r)
                .attr('transform', 'translate(-' + r + ',-' + r + ')')
                .attr('clip-path', 'url(#' + clipID + ')');
                            
            renderBubbleIcon(bubbleData, r, G, clipPath)
        });
        
        
        return svg;

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
            clusterLayer.registerMarker(marker);
        });
        
        
        
        // load pictures
        $.each(media.pictures, function(i, picture) {
            var marker = {
                loc: picture.loc,
                type: 'picture',
                uri: picture.uri,
                caption: picture.cap,
            }
            clusterLayer.registerMarker(marker);
        });
        
        
        
        // load text bubbles
        $.each(media.textbubbles, function(i, textbubble) {
            var marker = {
                loc: textbubble.loc,
                type: 'text',
                title: textbubble.title,
                text: textbubble.text,
            }
            clusterLayer.registerMarker(marker);
            
        
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




var mapBubbles = initMapBubbles();


