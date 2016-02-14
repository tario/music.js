// create the sound generator
var sineModulator = MUSIC.modulator(function(pl){
  return pl.gain(50).oscillator({type: "sine", frequency: 4.0}); 
});

var soundGenerator = {
  freq: function(fr) {
            return music
              .oscillator({type: 'square', frequency: fr, detune: sineModulator});
  }
};

// add instrument to show on UI
return new MUSIC.Instrument(soundGenerator);
