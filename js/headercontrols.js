


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
      $('body').addClass('side-panel-open');
    }
  }
  

  // monkey face icon
  $('#welcome-icon').click(function() {
    mediaOverlay.openOverlay({
      caption: 'Winslow Homer, a wild baby capuchin monkey', 
      picture:'corner-welcome.jpg',
      hideNextButton: true,
      hideOverviewButton: true,
      });
  });


  function closeSidePanel() {
    $('#side-panel').fadeOut(150);
    menuButtonClosed();
    $('body').removeClass('side-panel-open');
  }
  
  
  
  function menuButtonOpen() {
    $('#mobile-menu-button').addClass("menu-button-open");
    $('#back-to-map').fadeIn('fast');
  }
  
  function menuButtonClosed() {
    $('#mobile-menu-button').removeClass("menu-button-open");
    $('#back-to-map').hide();
  }
  

  // Delay video loading for quicker initial load
  function loadFamilyTrees() {
    if (!$('iframe#family-trees').attr('src')) {
      $('iframe#family-trees').attr('src', 'https://player.vimeo.com/video/13794237');
    }
  }


  
  $('#mobile-menu-button').click( function() { toggleSidePanel('#panel-mobile-menu'); return false; });
  $('#back-to-map').click( closeSidePanel );

  $('#tab-about, #menu-about').click( function() { loadFamilyTrees(); toggleSidePanel('#panel-about'); return false; });
  $('#tab-biographies, #menu-biographies').click( function() { toggleSidePanel('#panel-biographies'); return false; });
  $('#tab-donate, #menu-donate').click( function() { toggleSidePanel('#panel-donate'); return false; });
  $('#tab-reset, #menu-reset').click(function(){ introScreens.resetIntro(); return false; });
  
  
  $('.teacher-link').click(function() {
    closeSidePanel();
    toggleSidePanel('#panel-about');
    scrollToPanelLink('#about-teachers');
    loadFamilyTrees(); 
    return false;
  });
  
  
  // Smooth scroll side panel to element
  function scrollToPanelLink(selector) {
    var pos = $(selector).position().top + $('.side-panel-content:visible').scrollTop();
    $('.side-panel-content:visible').animate({'scrollTop': pos}, 500);
  }
  
  
  $('#close-side-panel').click(closeSidePanel);
  $('#map *, #map, #overlay *, #overlay').click(closeSidePanel);
  
  return {
    closeSidePanel: closeSidePanel,
    scrollToPanelLink: scrollToPanelLink
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
