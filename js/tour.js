

function initTour() {
    var slider = document.getElementById('tour-slider');
    
    noUiSlider.create(slider, {
        start: 0,
        range: {
            'min': 0,
            'max': media.tourlist.length,
        },
        connect: 'lower',
        step: 1,
    });
    
    
    
    // When a new icon is created, and it contains an item on the tour,
    // this method will get called so we can update the list of tour icons.
    // 'icon' should be a DOM element (not a jquery or d3 selection.)
    function registerIcon(tourID, icon) {
        media.tourlist[tourID].icon = icon;
    }
    
    
    
    // Check to see if an element is still in the DOM (it might have been deleted.)
    // 'obj' should be a plain DOM element, not a d3 selection.
    function isInDom(obj) {
        var root = $(obj).parents('html')[0] 
        return !!(root && root === document.documentElement);
    }
    
    
    
    slider.noUiSlider.on('update', function() {
        mediaOverlay.closeOverlay();
    
        var tourStop = media.tourlist[Number(this.get())];
        
        
        if (tourStop.icon && isInDom(tourStop.icon)) {
            // dispatch click event on the icon
            tourStop.icon.dispatchEvent(new MouseEvent("click"));
        }
        
        
        map.map.panTo(tourStop.loc, {duration:0.1});
    });
    
    
    
    return {
        registerIcon: registerIcon,
    }
}

tour = initTour();
