var soundGenerator = 
            music
              .oscillator({type: 'square'});

// create the instrument from sound generator
var instrument = 
    new MUSIC.Instrument(soundGenerator);

// create a multi-instrument with changed note values (12 semitones = 1 octave)
instrument = new MUSIC.MultiInstrument([
                instrument.mapNote(function(n) { return n + 24; }),
                instrument.mapNote(function(n) { return n + 36; }),
                instrument.mapNote(function(n) { return n + 48; })
                  ]);

// add instrument to show on UI
instruments.add("Square wave oscillator octave chord", instrument);