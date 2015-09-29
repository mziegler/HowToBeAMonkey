// include "map" from map.js




function initMapMedia() {
    
    
    
    function clusterIcons() {
    
    }
    
    
    
    
    
    
    
    
    
    // create a cluster layer, but don't add it to the map yet
    function ClusterLayer() {
    
        var clusterLayer = new PruneClusterForLeaflet(400);// CLUSTER SIZE?
        
        // disable spiderfy via monkey-patch
        clusterLayer.spiderfier.Spiderfy = function(){return false;};
        
        
        //clusterLayer.BuildLeafletClusterIcon = clusterBehaviorIcon;
        //clusterLayer.BuildLeafletCluster = buildClusterMarkerFactory(clusterLayer);
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


