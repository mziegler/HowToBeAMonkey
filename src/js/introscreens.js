





///////////////////////////////////////////////////////////////////////////////
// INTRO SCREENS

function initIntroScreens() {

  // hide the overlay screen
  function closeIntro() {
    $('#overlay-intro').fadeOut();
  }



  $('.overlay-intro-content').click(function() { return false }); // don't propagate click on content area



  // when the 'next' button on the first intro screen gets clicked
  $('#next-intro1').click(function() {

    map.animationLineClipPadding(); // don't clip the path for this animation

    closeIntro();

    // pretty gnarly code chaining animation sequence
    
    L.DomUtil.addClass(map.map._mapPane, 'leaflet-zoom-anim-slow'); // hack to slow down zoom animation
    $('.leaflet-marker-pane, .leaflet-shadow-pane').fadeOut(1000);
    map.map.setView([10.51185, -85.369238], 16,
        {pan:{animate:true, duration:1500}, zoom:{animate:true}}  );
    window.setTimeout(function(){ L.DomUtil.removeClass(map.map._mapPane, 'leaflet-zoom-anim-slow'); }, 1000);

    window.setTimeout(function() {
      L.DomUtil.addClass(map.map._mapPane, 'leaflet-zoom-anim-slow');
      map.map.setView([10.51185, -85.369238], 18,
        {pan:{animate:true, duration:1500}, zoom:{animate:true}}  );
      window.setTimeout(function(){ L.DomUtil.removeClass(map.map._mapPane, 'leaflet-zoom-anim-slow'); }, 1000);
      window.setTimeout(function() {
          $('.leaflet-marker-pane, .leaflet-shadow-pane').fadeIn('slow');
          window.setTimeout(function() {
            $('.overlay-intro-content').hide();
            $('#overlay-intro2').show();
            $('#overlay-intro').fadeIn('slow');
            
            
            map.resetLineClipPadding();  // restore old clip padding
          }, 500);
      }, 1600)
    }, 3000);
  });



  // when the 'next' button is clicked on the second intro screen
  $('#next-intro2').click(function() {
    map.map.setZoom(map.initialView[1], {animate:false});
    
    window.setTimeout(function() {
      closeIntro();
      map.map.panTo(map.initialView[0], {animate:true, duration:1.5, easeLinearity:1});
    }, 300);
    
    window.setTimeout(function() {
      map.startMarker.openPopup();
      map.resetLineClipPadding();  // restore old clip padding
      //L.DomUtil.removeClass(map._mapPane, 'leaflet-zoom-anim-slow');
    }, 2000);
    
  });




  function skipIntro() {
    $('div#overlay-intro').fadeOut('slow');
    headerControls.closeSidePanel();
    map.map.setView(map.initialView[0], map.initialView[1], {animate: true});
    setTimeout(function() { map.startMarker.openPopup(); }, 300);
  }
  $('div.skip-intro, #overlay-intro').click(skipIntro);


  function resetIntro() {
    headerControls.closeSidePanel();
    map.map.closePopup(); 
    $('div.overlay-intro-content').hide();
    $('div#overlay-intro1').show();
    $('div#overlay-intro').fadeIn('slow');
    setTimeout(function() { 
      map.map.setView(map.initialView[0], map.initialView[1], {animate: true});
    }, 500);
  }

  return {
    resetIntro: resetIntro
  }
}
var introScreens = initIntroScreens();




