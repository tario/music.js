function() {
  return function(music) {
    var soundGenerator = 
                music
                  .oscillator({type: 'square'});

    // create the instrument from sound generator
    var instrument = 
        new MUSIC.Instrument(soundGenerator);
    // add instrument to show on UI

    return new MUSIC.MultiInstrument([
                    instrument.mapNote(function(n) { return n + 24; }),
                    instrument.mapNote(function(n) { return n + 36; }),
                    instrument.mapNote(function(n) { return n + 48; })
                      ]);
  }
}
