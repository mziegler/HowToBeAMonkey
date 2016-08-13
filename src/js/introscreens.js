





///////////////////////////////////////////////////////////////////////////////
// INTRO SCREENS

function initIntroScreens() {

  // hide the overlay screen
  function closeIntro(callback) {
    mediaOverlay.closeOverlay();
  }



  function openIntro() {
    mediaOverlay.openOverlay({
      picture: 'baby.gif',
      bigtitle: 'Ever wonder what it\'s like to be a baby monkey?',
      caption: '<div id="overlay-bigtitle-inner"><p>This map will give you a peek into their lives, with real scientific data collected by monkey researchers.</p><p>We can learn a lot about humans by studying monkeys &mdash; how did monkeys evolve to be so smart?  <span style="color:#555">(We should be careful not to go too far though.  Humans and monkeys are different!)</span></p></div>',
      nextButtonCallback: secondIntroScreen,
    });
  }
  openIntro();



  function secondIntroScreen() {
    setTimeout(function() {
      mediaOverlay.openOverlay({
        picture: 'hello.jpg',
        title: 'Meet Winslow Homer!',
        caption: '<p>He\'s the star of our show.  Winslow is the alpha female\'s baby, so everybody wants to play with him and groom him to score points with the alpha female.  He loves the attention &mdash; a little prince charming!</p>',
        nextButtonCallback: showStartPoint,
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

  return {
    resetIntro: resetIntro,
    closeIntro: closeIntro,
  }
}
var introScreens = initIntroScreens();




