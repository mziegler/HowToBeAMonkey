// include map.js, tour.js




function initMapBubbles() {
    
    
    var clusterDiameter = 330;
    var clusterMargin = 8;
    
    
    // Range over which to show icons
    // var zoomRange = {min: ??, max: ??};
    
    
    // Bounding box in which to compute the hex layout
    var hexBinBounds = {
            top: 10.516,
            bottom: 10.5075,
            left: -85.3745,
            right: -85.3605,
        };
        
    
    // The HexBinLayer to be initialized on this map
    var _hexBinLayer = null;
    
    
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
            
            
            this._hexCenters = []; // list of hex centers
            
            
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
            this._moveend();
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
       
            var bounds = map.getBounds().pad(0.25);
       
            // loop over clusters
            this._el.selectAll('div.hexcluster').each(function(clusterdata, i) {
                
                if (
                    // does this cluster not have bubble icons yet? 
                    d3.select(this).select('svg').empty()
                    
                        &&
                    
                    // is this cluster within the visible bounds of the map?
                    bounds.contains([clusterdata.y + hexBinBounds.top, clusterdata.x + hexBinBounds.left])
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
                
            
        
            this._hexCenters = this._el.selectAll('div.hexcluster') //g.hex-enter')
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
                
             var i = 0;
            
  
                
        },
        
        
        
        
        // Given a [lat,lon] location, return a D3 selection with the cluster containing
        // this point.
        locToCluster: function(loc) {
        
            // Use the d3 layout to cluster a single point, we will get 1 cluster
            var clusterCoords = this._layout([{loc:loc}])[0];
            
            // Find the existing cluster with matching coords to the computed new cluster
            return this._hexCenters.filter(function(d, i) {
                return d.i == clusterCoords.i && d.j == clusterCoords.j;
            });
        },
          
        
    });   

    
    
    
    
    
    
    // generate unique cluster-icon class names
    var uniqueIDCounter = 0;
    function uniqueIDGenerator() {
        uniqueIDCounter += 1;
        return 'WH-auto-' + uniqueIDCounter;
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

                case 'start':
                    bubbleGroups.start = observation;
                    break;
                    
                case 'end':
                    bubbleGroups.end = observation;    
            }
        });
        
        
        
        
        // 2d list of bubble groups
        var sortedBubbles = [];
        function insertRandom(obj) {
            var randomIndex = Math.floor(Math.random() * sortedBubbles.length);
            sortedBubbles.splice(randomIndex, 0, obj);
        }
        
        
        // create list of groups for behavior categories
        var categoryGroups = {};
        $.each(media.categoryGroups, function(i, g) {
            categoryGroups[g] = {
                cats: [],
                count: 0,
                score: 0,
            }
        });
        
        
        $.each(bubbleGroups.behavior, function(cat, observations) {
            var group = categoryGroups[media.categories[cat].group];
            
            
            // tally up scores, and collect tour ID's
            var scoreSum = 0;
            var tour_ids = [];
            $.each(observations, function(i, ob) {
                scoreSum = scoreSum + ob.score;
                
                if (ob.tour_id) {
                    tour_ids.push(ob.tour_id);
                }
                
            });
            
            var medianTime = observations[Math.floor(observations.length / 2)].time;
                      
            group.cats.push({
                score: scoreSum,
                value: Math.max(Math.min(scoreSum,70), 5), //Math.max(Math.min(observations.length, 70), 20),
                type: 'behaviorGroup',
                observations: observations,
                cat: cat,
                tour_ids: tour_ids,
                time: medianTime,
            });
            
            group.count = group.count + observations.length;
            group.score = group.score + scoreSum;
        });
        
        
        $.each(categoryGroups, function(i,g) { 
            insertRandom({
                value: Math.max(Math.min(g.score, 20), 150),
                type: 'layoutGroup',
                children: g.cats
            });
        });
        
        
        
        
        // randomly insert pictures
        $.each(bubbleGroups.picture, function(i, item) {
            item.value= Math.random() * 50 + 50;
            insertRandom(item);
        });
        
        
        
        // randomly insert text
        $.each(bubbleGroups.text, function(i, item) {
            item.value= Math.random() * 20 + 100;
            insertRandom(item);
        });
        
        
        
        // insert start and end markers in the middle of the cluster (= front of array)
        if (bubbleGroups.start) {
            bubbleGroups.start.value = 200;
            sortedBubbles.splice(0, 0, bubbleGroups.start);
        }
        
        if (bubbleGroups.end) {
            bubbleGroups.end.value = 200;
            sortedBubbles.splice(0, 0, bubbleGroups.end);
        }
        
        
        // flatten sorted bubble array
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
                    tour.updateSlider(G[0][0], d.time);
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
                    tour.updateSlider(G[0][0], d.time);
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
                    
                /*
                renderText(bubbleData.observations.length.toString() + '/' + bubbleData.score.toString(), r, 10, G)
                    .attr('fill', 'black')
                    .style('font-weight', 'bold');
                */
                
                
                    
                G.on('click', function(d, i) {
                    mapMedia.openBehaviorPopup(d, this);
                    tour.updateSlider(G[0][0], d.time);
                    d3.event.stopPropagation();
                });
                break;
                
                
            case 'start':
                G.append('image')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', 2*r)
                    .attr('height', 2*r)
                    .attr('xlink:href', 'icons/awake.png')
                    .attr('preserveAspectRatio', 'xMidYMid slice');
                
                G.on('click', function(d, i) {
                    mapMedia.openTextPopup(d, this);
                    tour.updateSlider(G[0][0], d.time);
                    d3.event.stopPropagation();
                });
                
                break;
                
                                
            case 'end':
                G.append('image')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', 2*r)
                    .attr('height', 2*r)
                    .attr('xlink:href', 'icons/bedtime.png')
                    .attr('preserveAspectRatio', 'xMidYMid slice');
                    
                G.on('click', function(d, i) {
                    mapMedia.openTextPopup(d, this, true);
                    tour.updateSlider(G[0][0], d.time);
                    d3.event.stopPropagation();
                });
                
                break;    
            
        }
        
        // register tour markers
        if (bubbleData.tour_ids && bubbleData.tour_ids.length > 0) {
            $.each(bubbleData.tour_ids, function(i, tour_id) {
                tour.registerIcon(tour_id, G[0][0]); // use the G DOM element, not the d3 selection
            });
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
            //var r = Math.min(bubbleData.r, bubbleData.value); 
            var r = bubbleData.r;
            
            var G = thisNode.append("g")
                .attr('width', 2*r)
                .attr('height', 2*r)
                .attr('transform', 'translate(-' + r + ',-' + r + ')')
                .attr('clip-path', 'url(#' + clipID + ')');
                            
            renderBubbleIcon(bubbleData, r, G, clipPath);
            
            G.on('mouseover', selectBubbleAnimation);
            G.on('mouseout', unselectBubbleAnimation);
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
                score: observation.score,
                category: observation.cat,
                text: observation.text,
            };
            
            if (observation.tour_id) {
                marker.tour_id = observation.tour_id;
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
                time: picture.time,
            };
            
            if (picture.tour_id) {
                marker.tour_ids = [picture.tour_id];
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
                time: textbubble.time,
            }
            
            if (textbubble.tour_id) {
                marker.tour_ids = [textbubble.tour_id];
            }
            
            clusterLayer.registerMarker(marker);
            
        
        });
        
        
        
        // start marker
        clusterLayer.registerMarker({
            loc: media.WHtrack[0],
            type: 'start',
            tour_ids: [1],
            title: media.startPopup.title,
            text: media.startPopup.text,
            time: media.startPopup.time,
        });
        
        // end marker
        clusterLayer.registerMarker({
            loc: media.WHtrack[media.WHtrack.length - 1],
            type: 'end',
            tour_ids: [media.tourlist.length - 1],
            title: media.endPopup.title,
            text: media.endPopup.text,
            time: media.endPopup.time,
        });
        
        
        
        map.map.addLayer(clusterLayer);
        
        return clusterLayer;
    }
    
    
    
    
    
    // load behavior points
    $.getJSON('behavior.json')
    .done( function(behavior) {
        _hexBinLayer = loadBubbleMedia(media, behavior);
    });
    

    
    
    // Given a [lat,lon] loc, render the containing cluster
    function renderLoc(loc) {
        if (_hexBinLayer) {
            var cluster = _hexBinLayer.locToCluster(loc);
       
            bubbleSVG(cluster.datum(), cluster); 
        }
    }

    

    
    function selectBubbleAnimation(d, i, el) {
         var svg = d3.select((el ? el : this).parentNode.parentNode);
         
         var circle = svg.insert('circle', ':first-child')
            .classed('bubble-selection', true)
            .attr('fill', 'none')
            .attr('r', d.r)
            .attr('stroke', 'white')
            .attr('cx', d.x)
            .attr('cy', d.y)
            .attr('stroke-width', 0)
            .attr('stroke-opacity', 0)
            .transition()
            .duration(150)
            .attr('r', d.r + 2)
            .attr('stroke-width', 5)
            .attr('stroke-opacity', 1);
    }


    function unselectBubbleAnimation(d, i) {
        d3.selectAll('.bubble-selection')
            .classed('bubble-selection', false)
            .transition()
            .duration(250)
            .attr('stroke-opacity', 0)
            .attr('stroke-width', 15)
            .attr('r', function(d,i) { 
                return d3.select(this).attr('r') + 20 
            })
            .transition()
            .remove();
    }


    return {
        renderLoc: renderLoc,
    }
}




var mapBubbles = initMapBubbles();


