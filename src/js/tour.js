

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
    function registerIcon(tourID, icon) {
        media.tourlist[tourID].icon = icon;
    }
    
    
    
    return {
        registerIcon: registerIcon,
    }
}

tour = initTour();
