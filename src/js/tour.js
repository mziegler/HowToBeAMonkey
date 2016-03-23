

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
}

tour = initTour();
