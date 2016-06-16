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
      $('#overlay-tour-next').addClass('tour-next').off('click').show();
    }
    
    
    
    function openOverlay(options) {
    // options : {title, caption, picture, video, hideNextButton, nextButtonCallback}
    
    
      clearOverlay();
    
      // If we're loading an image, scroll down animation only if both 
      // 1) the image is completely loaded, and 2) the overlay is visible.
      var imageLoaded = false;
      var doneOpening = false;
    
      if (options.title) {
        $('#overlay-title').html(options.title)
          .addClass('filled');
      }
      
      if (options.caption) {
        $('#overlay-caption').html(options.caption)
          .addClass('filled');
      }
      
      if (options.picture) {
        var img = $('<img>');
        
        img.on('load', function() {
          imageLoaded = true;
          if(doneOpening) {
            $("#overlay-scrollable").animate({ scrollTop: $('#overlay-scrollable').prop("scrollHeight")}, 2000);
          }
        });
        
        img.attr('src', 'pictures/' + options.picture);
        
        $('#overlay-media').append(img).addClass('filled');
        
        
        //$('#overlay-media').html('<img src="pictures/' + picture + '">')
        //  .addClass('filled');
      }
      
      if (options.hideNextButton) {
        $('#overlay-tour-next').hide();
      }
      
      if (options.nextButtonCallback) {
        $('#overlay-tour-next').removeClass('tour-next').on('click', options.nextButtonCallback);
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
