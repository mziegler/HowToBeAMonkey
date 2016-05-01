





///////////////////////////////////////////////////////////////////////////////
// INTRO SCREENS

function initIntroScreens() {

  // hide the overlay screen
  function closeIntro(callback) {
    $('#overlay-intro').fadeOut(400, callback);
  }



  $('.overlay-intro-content').click(function() { return false }); // don't propagate click on content area



  // when the 'next' button on the first intro screen gets clicked
  $('#next-intro1').click(function() {

    closeIntro(function(){
      $('.overlay-intro-content').hide();
      $('#overlay-intro2').show();
      $('#overlay-intro').fadeIn('slow');
    });
    

  });



  // when the 'next' button is clicked on the second intro screen
  $('#next-intro2').click(function() {
    closeIntro();
    tour.tourNext();
  });




  function skipIntro() {
    $('div#overlay-intro').fadeOut('slow');
    headerControls.closeSidePanel();
    map.map.setView(map.initialView[0], map.initialView[1], {animate: true});
    tour.tourNext();
  }
  $('div.skip-intro, #overlay-intro').click(skipIntro);


  function resetIntro() {
    headerControls.closeSidePanel();
    mediaOverlay.closeOverlay();
    
    map.map.closePopup(); 
    $('div.overlay-intro-content').hide();
    $('div#overlay-intro1').show();
    $('div#overlay-intro').fadeIn('slow');
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




