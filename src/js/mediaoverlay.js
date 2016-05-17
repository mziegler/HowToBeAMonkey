function initMediaOverlay() {
    
    
    // hide overlay when background is clicked
    $('#overlay-background').click(closeOverlay);
    
    // hide the overlay
    function closeOverlay() {
      $('#overlay-background').fadeOut('fast');
    }
    
    
    // empty out the content in the overlay DOM elements
    function clearOverlay() {
      $('#overlay-media, #overlay-title, #overlay-caption')
        .empty().removeClass('filled');
      $('#overlay-tour-next').show();
    }
    
    
    
    function openOverlay(title, caption, picture, video, hideNextButton) {
    
      clearOverlay();
    
      // If we're loading an image, scroll down animation only if both 
      // 1) the image is completely loaded, and 2) the overlay is visible.
      var imageLoaded = false;
      var doneOpening = false;
    
      if (title) {
        $('#overlay-title').html(title)
          .addClass('filled');
      }
      
      if (caption) {
        $('#overlay-caption').html(caption)
          .addClass('filled');
      }
      
      if (picture) {
        var img = $('<img>');
        
        img.on('load', function() {
          imageLoaded = true;
          if(doneOpening) {
            $("#overlay-scrollable").animate({ scrollTop: $('#overlay-scrollable').prop("scrollHeight")}, 2000);
          }
        });
        
        img.attr('src', 'pictures/' + picture);
        
        $('#overlay-media').append(img).addClass('filled');
        
        
        //$('#overlay-media').html('<img src="pictures/' + picture + '">')
        //  .addClass('filled');
      }
      
      if (hideNextButton) {
        $('#overlay-tour-next').hide();
      }
      
      map.map.closePopup();
      

      
      $('#overlay-background').fadeIn(400, function() {
        doneOpening = true;
        if (imageLoaded) {
          $("#overlay-scrollable").animate({ scrollTop: $('#overlay-scrollable').prop("scrollHeight")}, 2000);
        }
      });
      $('#overlay-scrollable').scrollTop(0);  

      //$("#overlay-scrollable").animate({ scrollTop: $('#overlay-scrollable').prop("scrollHeight")}, 2000);
      
    }
    
    
    return {
      openOverlay: openOverlay,
      closeOverlay: closeOverlay,
    }
}


var mediaOverlay = initMediaOverlay();
