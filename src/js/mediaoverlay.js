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
    }
    
    
    
    function openOverlay(title, caption, picture, video) {
      if (title) {
        $('#overlay-title').html(title)
          .addClass('filled');
      }
      
      if (caption) {
        $('#overlay-caption').html(caption)
          .addClass('filled');
      }
      
      if (picture) {
        $('#overlay-media').html('<img src="pictures/' + picture + '">')
          .addClass('filled');
      }
      
      map.map.closePopup();
      $('#overlay-background').fadeIn();
      
    }
    
    
    return {
      openOverlay: openOverlay,
      closeOverlay: closeOverlay,
    }
}


var mediaOverlay = initMediaOverlay();
