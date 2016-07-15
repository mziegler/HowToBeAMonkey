function initMediaOverlay() {
    
    
    // hide overlay when background is clicked
    $('#overlay-background').click(closeOverlay);
    $('#overlay-content').click(function(event) { event.stopPropagation(); });
    
    // hide the overlay
    function closeOverlay() {
      $('#overlay-background').fadeOut('fast', function() {
        $('#overlay-media').empty(); // stop video playing
      });
      map.showFloatingNext();
    }
    
    $('#overlay-close').click(closeOverlay);
    
    // empty out the content in the overlay DOM elements
    function clearOverlay() {
      $('#overlay-media, #overlay-title, #overlay-bigtitle, #overlay-caption')
        .empty().removeClass('filled');
      $('#overlay-tour-next').off('click').on('click', function() {tour.tourNext()}).show();
      $('#overlay-tour-next')
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
      map.hideFloatingNext();

    
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
        
        img.attr('src', 'pictures/' + options.picture);
        
        $('#overlay-media').append(img).addClass('filled');
      }
      
      
      if (options.video) {
        var iframe = $('<iframe id="overlay-video" src="' + options.video + '?autoplay=1&api=1&player_id=overlay-video" frameborder="0" width="640" height="360" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
        
        $('#overlay-media').append(iframe).addClass('filled');
        
        player = $f(iframe[0]);
        player.addEvent('ready', function() {
          player.addEvent('finish', function() { 
            $("#overlay-scrollable").animate({ scrollTop: 0}, 1500);
          });
        });
      }
      
      
      if (options.hideNextButton) {
        $('#overlay-tour-next').hide();
      }
      
      if (options.nextButtonCallback) {
        $('#overlay-tour-next').off('click').on('click', options.nextButtonCallback);
      }
      
      
      map.map.closePopup();
      

      
      $('#overlay-background').fadeIn(400, function() {
        if (options.picture) {
          $("#overlay-scrollable").animate({ scrollTop: 0}, 1000);
        }
      });
      
      
      // For pictures, start at the bottom and then pan up.  For others, start at the top.
      if (options.picture) {
        $('#overlay-scrollable').scrollTop($('#overlay-scrollable').prop("scrollHeight"));  
      }
      else {
        $('#overlay-scrollable').scrollTop(0);  
      }
      
      resizeVideo();


      //$("#overlay-scrollable").animate({ scrollTop: $('#overlay-scrollable').prop("scrollHeight")}, 2000);
      
    }
    
    
    
    
    return {
      openOverlay: openOverlay,
      closeOverlay: closeOverlay,
    }
}


var mediaOverlay = initMediaOverlay();
