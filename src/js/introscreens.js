





///////////////////////////////////////////////////////////////////////////////
// INTRO SCREENS

function initIntroScreens() {

  // hide the overlay screen
  function closeIntro(callback) {
    mediaOverlay.closeOverlay();
  }



  function openIntro() {
    mediaOverlay.openOverlay({
      picture: 'chew.gif',
      title: 'Ever wonder what it\'s like to be a baby monkey?',
      caption: 'This map will give you a peek into their lives, with real scientific data collected by monkey researchers.<br /><br />We can learn a lot about humans by studying monkeys &mdash; how did monkeys evolve to be so smart?  <span style="color:#555">(We should be careful not to go too far though.  Humans and monkeys are different!)</span>',
      nextButtonCallback: secondIntroScreen,
    });
  }
  openIntro();



  function secondIntroScreen() {
    setTimeout(function() {
      mediaOverlay.openOverlay({
        picture: 'hello.jpg',
        title: 'Meet Winslow Homer',
        caption: 'He\'s the star of our show.  Winslow is the alpha female\'s baby, so everybody wants to play with him and groom him to gain the alpha female\'s favor.  He loves the attention &mdash; a little prince charming!'
      });
    }, 300);
  }


  function resetIntro() {
    headerControls.closeSidePanel();
    mediaOverlay.closeOverlay();
    map.map.closePopup(); 
    
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




