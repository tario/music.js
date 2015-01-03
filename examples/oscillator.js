// create the sound generator
var soundGenerator = 
            music
              .oscillator({type: 'square'});

// create the instrument from sound generator
var instrument = 
    new MUSIC.Instrument(soundGenerator)
                .mapNote(function(n) { return n + 36; });

// add instrument to show on UI
instruments.add("Square wave oscillator", instrument);