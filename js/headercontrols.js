


///////////////////////////////////////////////////////////////////////////////
// HEADER CONTROLS

function initHeaderControls() {
  function toggleSidePanel(contentSelector) {
    if ($(contentSelector).is(':visible')) {
      closeSidePanel();
    }
    else {
      $('.side-panel-content').hide();
      $(contentSelector).fadeIn('fast');
      $('#side-panel').fadeIn('fast');
      menuButtonOpen();
    }
  }
  

  // monkey face icon
  $('#welcome-icon').click(function() {
    mediaOverlay.openOverlay({
      caption: 'Winslow Homer, a wild baby capuchin monkey', 
      picture:'corner-welcome.jpg',
      hideNextButton: true,
      });
  });


  function closeSidePanel() {
    $('#side-panel').fadeOut(150);
    menuButtonClosed();
  }
  
  
  
  function menuButtonOpen() {
    $('#mobile-menu-button').addClass("menu-button-open");
    $('#back-to-map').fadeIn('fast');
  }
  
  function menuButtonClosed() {
    $('#mobile-menu-button').removeClass("menu-button-open");
    $('#back-to-map').fadeOut('fast');
  }
  

  
  $('#mobile-menu-button').click( function() { toggleSidePanel('#panel-mobile-menu'); return false; });
  $('#back-to-map').click( closeSidePanel );

  $('#tab-about, #menu-about').click( function() { toggleSidePanel('#panel-about'); return false; });
  $('#tab-biographies, #menu-biographies').click( function() { toggleSidePanel('#panel-biographies'); return false; });
  $('#tab-donate, #menu-donate').click( function() { toggleSidePanel('#panel-donate'); return false; });
  $('#tab-reset, #menu-reset').click(function(){ introScreens.resetIntro(); return false; });
  
  
  $('#close-side-panel').click(closeSidePanel);
  $('#map *, #map, #overlay *, #overlay').click(closeSidePanel);
  
  return {
    closeSidePanel: closeSidePanel
  }
}
headerControls = initHeaderControls();



///////////////////////////////////////////////////////////////////////////////
// LOAD FONTS
FontFaceOnload("Fira Sans", {
  success: function() {
    document.documentElement.className += " fonts-loaded";
  },
});



///////////////////////////////////////////////////////////////////////////////
// ELIMINATE 300ms TAP DELAY ON MOBILE DEVICES
$(function() {
  FastClick.attach(document.body);
});
