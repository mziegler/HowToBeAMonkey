// require map.js


function initMapMedia() {


    // Return the Lat/Lng coordinates of the location to open a popup over a bubble icon
    function popupLoc(bubbleElem, bubbleRadius) {
    
            var mapOffset = $('#map').offset();
            var iconOffset = $(bubbleElem).offset();
            var containerPoint = L.point(iconOffset.left-mapOffset.left+bubbleRadius, iconOffset.top-mapOffset.top+5);
            
            return map.map.containerPointToLatLng(containerPoint);
            
    }
    
    
    
    
    



    //////////////////////////////////////////////////////////////////////////
    // TEXT POPUPS
    
    
    
    // Open text-bubble pop up
    function openTextPopup(bubbleData, element) {
            
        map.map.openPopup(  
          (
            '<div class="popup-title">' +
            bubbleData.title.replace('\\n', ' ') +
            '</div><div class="caption">' +
            bubbleData.text + 
            '</div>'
          ),
          
          popupLoc(element, bubbleData.r),
          
          {
            className:'behavior-popup texbox-popup', 
            maxWidth:500,
            minWidth:500,
            fullWidth: 500,
            keepInView: false
          }
        ).on('click', function(){ headerControls.closeSidePanel() });
    
        headerControls.closeSidePanel();
    }
    
    







    //////////////////////////////////////////////////////////////////////////
    // BEHAVIOR POPUPS


    // generate HTML for behavior popups
    function popupHTML(points) { 
        
      var category = points[0].category;
        
      var html = '<div class="popup-title popup-title-c' + category + '">' + media.categories[category].name + '</div><div class="behavior-list"><table><tbody class="behavior-points-initial">';
      
      // highest-ranking points
      points.sort(function(a,b) {
        return b.rank-a.rank;
      });

      var topPoints = [];
      var topPointsSet = {};
      for (var i = 0; i < points.length && topPoints.length < 4; i++) {
        if (!topPointsSet.hasOwnProperty(points[i].text)) {
          topPointsSet[points[i].text] = true;
          topPoints.push(points[i]);
        }
      }


      // sort top points by time
      topPoints.sort(function(a,b) {  
        return a.time.localeCompare(b.time);
      }); 
      
      
      for (var i = 0; i < topPoints.length; i++) {    
        html += '<tr><td class="behavior-timestamp">' + topPoints[i].time + '</td><td class="behavior-point">' + topPoints[i].text + '</td></tr>';
      }
      
      
      // if we're not showing all the points, list all of the points for the cluster
      // in a hidden tbody and show 'see all points' link
      if (points.length > topPoints.length) {
        html += '</tbody><tbody class="behavior-points-hidden" style="display:none;">'
        
        // sort all points by time
        points.sort(function(a,b) {
          return a.time.localeCompare(b.time);
        });
        
        for (var i = 0; i < points.length; i++) {    
          html += '<tr><td class="behavior-timestamp">' + points[i].time + '</td><td class="behavior-point">' + points[i].text + '</td></tr>';
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





    function openBehaviorPopup(bubbleData, element) {
        
        map.map.openPopup(
            popupHTML(bubbleData.observations),
        
            popupLoc(element, bubbleData.r),
            
            {
                minWidth: 400, 
                maxWidth: 400,
                fullWidth: 400,
                className: 'behavior-popup',
                keepInView: false
            }
        ).on('click', headerControls.closeSidePanel);
        
        headerControls.closeSidePanel();
        
    }








    //////////////////////////////////////////////////////////////////////
    // PICTURES
    
    function openPicture(bubbleData, element) {
        $('a#lightbox-trigger')
            .attr('href', 'pictures/' + bubbleData.uri)
            .attr('data-lightbox', 'pictureLayer-' + bubbleData.uri)
            .attr('data-title', bubbleData.caption)
            .click();
            
            
        headerControls.closeSidePanel();
    }








    return {
        openTextPopup: openTextPopup,
        openBehaviorPopup: openBehaviorPopup,
        openPicture: openPicture,
    }

}

var mapMedia = initMapMedia();
