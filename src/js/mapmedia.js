// require map.js


function initMapMedia() {


    // Return the Lat/Lng coordinates of the location to open a popup over a bubble icon
    function popupLoc(bubbleElem, bubbleRadius) {
    
            var mapOffset = $('#map').offset();
            var iconOffset = $(bubbleElem).offset();
            var containerPoint = L.point(iconOffset.left-mapOffset.left+bubbleRadius, iconOffset.top-mapOffset.top+5);
            
            return map.map.containerPointToLatLng(containerPoint);
            
    }
    
    
    


    
    
    
    // Open text-bubble pop up
    function openTextPopup(bubbleData, element) {
            
        map.map.openPopup(  
          (
            '<div class="popup-title">' +
            bubbleData.title +
            '</div><div class="caption">' +
            bubbleData.text + 
            '</div>'
          ),
          
          popupLoc(element, bubbleData.r),
          
          {
            className:'behavior-popup texbox-popup', 
            maxWidth:500,
            minWidth:500,
            fullWidth: 500
          }
        ).on('click', function(){ headerControls.closeSidePanel() });
    
    }
    
    









    function openBehaviorPopup(bubbleData, element) {
    
    }


















    return {
        openTextPopup: openTextPopup,
    }

}

var mapMedia = initMapMedia();
