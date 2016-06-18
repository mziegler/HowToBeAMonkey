function initMediaOverlay() {
    
    
    // hide overlay when background is clicked
    $('#overlay-background').click(closeOverlay);
    
    // hide the overlay
    function closeOverlay() {
      $('#overlay-background').fadeOut('fast');
    }
    
    
    // empty out the content in the overlay DOM elements
    function clearOverlay() {
      $('#overlay-media, #overlay-title, #overlay-bigtitle, #overlay-caption')
        .empty().removeClass('filled');
      $('#overlay-tour-next').addClass('tour-next').off('click').show();
    }
    
    
    
        
    // keep 16/9 aspect ratio for videos   
    function resizeVideo() {
      if ($('#overlay-video')) {
        var mediaWidth = $('#overlay-media').width();
        $('#overlay-video').attr({
          width: mediaWidth,
          height: mediaWidth * 9/16,
        });
      }
    }
    $(window).on('resize', resizeVideo);
    
    
    function openOverlay(options) {
    // options : {title, bigtitle, caption, picture, video, hideNextButton, nextButtonCallback}
    
    
      clearOverlay();
    
      // If we're loading an image, scroll down animation only if both 
      // 1) the image is completely loaded, and 2) the overlay is visible.
      var imageLoaded = false;
      var doneOpening = false;
    
      if (options.title) {
        $('#overlay-title').html(options.title)
          .addClass('filled');
      }
      
      if (options.bigtitle) {
        $('#overlay-bigtitle').html(options.bigtitle)
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
      }
      
      
      if (options.video) {
        var iframe = $('<iframe id="overlay-video" src="' + options.video + '" frameborder="0" width="640" height="360" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
        
        $('#overlay-media').append(iframe).addClass('filled');
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
      resizeVideo();


      //$("#overlay-scrollable").animate({ scrollTop: $('#overlay-scrollable').prop("scrollHeight")}, 2000);
      
    }
    
    
    
    
    return {
      openOverlay: openOverlay,
      closeOverlay: closeOverlay,
    }
}


var mediaOverlay = initMediaOverlay();
