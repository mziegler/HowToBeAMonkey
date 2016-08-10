

function initTour() {

    // keep track of the last open icon, so we don't 
    var lastOpenIcon = null;



    var slider = document.getElementById('tour-slider');
    noUiSlider.create(slider, {
        start: 0,
        range: {
            'min': 0,
            'max': media.tourlist.length - 1,
        },
        connect: 'lower',
        step: 1,
    });
    
    
    
    // Show time in tour handle
    slider.noUiSlider.on('update', function() {
        var time = media.tourlist[Number(slider.noUiSlider.get())].time.substr(0,5);
        $('.noUi-handle', slider).text(time);
    });
    
    
    // When a new icon is created, and it contains an item on the tour,
    // this method will get called so we can update the list of tour icons.
    // 'icon' should be a DOM element (not a jquery or d3 selection.)
    
    // 'panToBubble' is true if we should pan to this bubble when it's selected
    // (as opposed to Leaflet autopan.)
    function registerIcon(tourID, icon, panToBubble) {
        media.tourlist[tourID].icon = icon;
        media.tourlist[tourID].panToBubble = panToBubble;
    }
    
    
    
    // Check to see if an element is still in the DOM (it might have been deleted.)
    // 'obj' should be a plain DOM element, not a d3 selection.
    function isInDom(obj) {
        var root = $(obj).parents('html')[0] 
        return !!(root && root === document.documentElement);
    }
    
    
    
    function getTourStop() {
        return media.tourlist[Number(slider.noUiSlider.get())];
    }
    
    
    
    // open the corresponding icon/popup/media for this position on the slider
    function openSelectedIcon() {
        map.startTourTransition();
        mediaOverlay.closeOverlay();
        introScreens.closeIntro();
        map.map.closePopup();
        
        if (map.map.getZoom() < 17) {
            map.map.setZoom(18);
        }
        
        var tourStop = getTourStop();
        
        // open the intro screen
        if (tourStop.note == 'intro') {
            introScreens.resetIntro();
            map.endTourTransition();
            return;
        }
        
        // Render the icon if it isn't already rendered
        // Potential bug: (this may possibly fail sometimes due to an 
        // order-of-execution problem, but I haven't really thought it through.
        if (! tourStop.icon || !isInDom(tourStop.icon)) {        
            mapBubbles.renderLoc(tourStop.loc);
        }
        
        // dispatch click event on the icon 
        lastOpenIcon = tourStop.icon;
        
        // Show an animation for this bubble
        if (tourStop.panToBubble) {
            map.map.panTo(tourStop.loc, {animate:true, duration:0.5});
            setTimeout(function() {
                tourStop.icon.dispatchEvent(new MouseEvent("click"));
            }, 700);
                            
        }
        
        else {
            tourStop.icon.dispatchEvent(new MouseEvent("click"));
        }
        
        map.endTourTransition();
    }
    
    
    
    // when the slider position is updated, open the corresponding icon
    slider.noUiSlider.on('change', openSelectedIcon );
    
    // when the slider is dragged, pan the map position
    /*
    slider.noUiSlider.on('slide', function() {
        mediaOverlay.closeOverlay();
        
        var tourStop = media.tourlist[Number(slider.noUiSlider.get())];
        map.map.panTo(tourStop.loc, {duration:0.1});
    });
    */
    
    
    
    
    
    // move the slider to the next position
    function tourNext() {
        slider.noUiSlider.set(Number(slider.noUiSlider.get()) + 1);
        openSelectedIcon();
    }
    
    
    $('#map-container').on('click', '.tour-next', tourNext);
    
    
    
    
    
    // Update the position of the slider
    // called when the user clicks an icon.
    function updateSlider(icon, time) {
    
        // Make sure that this icon was clicked instead of selected via the slider,
        // in which case lastOpenIcon will not already be set to this icon.
        // (Otherwise, the time for a behavior popup might be computed differently,
        // and the next button might get stuck in a loop.)
        if (lastOpenIcon !== icon) {
            
            // find correct index on slider (TODO binary sort would be quicker.)
            // Price-is-right style -- the tour index with the closest time to the
            // selected icon, but not over.
            
            var sliderIndex = media.tourlist.length - 1;
            $.each(media.tourlist, function(i, tourStop) {
                if (tourStop.time > time) {
                    sliderIndex = Math.max(0, i-1);
                    return false; // break
                }
            });
            
            
            slider.noUiSlider.set(sliderIndex);
        }
    }
    
    
    
    return {
        registerIcon: registerIcon,
        updateSlider: updateSlider,
        tourNext: tourNext,
        getTourStop: getTourStop,
    }
}

tour = initTour();
