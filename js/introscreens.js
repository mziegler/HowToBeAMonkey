





///////////////////////////////////////////////////////////////////////////////
// INTRO SCREENS

function initIntroScreens() {

  // hide the overlay screen
  function closeIntro(callback) {
    mediaOverlay.closeOverlay();
  }



  function openIntro() {
    mediaOverlay.openOverlay({
      picture: media.introScreen.picture,
      bigtitle: media.introScreen.title,
      caption: media.introScreen.caption,
      nextButtonCallback: secondIntroScreen,
      hideBackToMap: true,
      hideOverviewButton: true,
      showTeacherLink: true,
    });
  }
  openIntro();



  function secondIntroScreen() {
    setTimeout(function() {
      mediaOverlay.openOverlay({
        picture: media.secondIntroScreen.picture,
        title: media.secondIntroScreen.title,
        caption: media.secondIntroScreen.caption,
        nextButtonCallback: showStartPoint,
        hideBackToMap: true,
        hideOverviewButton: true,
      });
    }, 300);
  }


  // Close the intro screen, and delay the popup for the start point so the user
  // can see the GPS track label.
  function showStartPoint() {
    map.startTourTransition();
    mediaOverlay.closeOverlay();
    setTimeout(tour.tourNext, 700);
  }


  function resetIntro() {
    headerControls.closeSidePanel();
    mediaOverlay.closeOverlay();
    map.map.closePopup(); 
    tour.resetSlider();
    
    openIntro();
    
    setTimeout(function() { 
      map.map.setView(map.initialView[0], map.initialView[1], {animate: true});
    }, 500);
  }


  
  function openLegend() {
    mediaOverlay.openOverlay({
      title: media.legendScreen.title,
      caption: media.legendScreen.caption,
    });
  }
  $('#button-legend').click(openLegend);



  return {
    resetIntro: resetIntro,
    closeIntro: closeIntro,
    openLegend: openLegend,
  }
}
var introScreens = initIntroScreens();




