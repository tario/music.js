// create the sound generator

var amplitude = 1.03;
var wfr = 100;
var vibrato = function(fr) {
  return function(t) {
    return Math.pow(amplitude, Math.sin(t*wfr))*fr;
  };
};

var soundGenerator = {
  freq: function(fr) {
            return music
              .oscillator({type: 'square', frequency: new MUSIC.Curve.Formula(vibrato(fr),100).during(4.0)});
  }
};

// create the instrument from sound generator
var instrument = 
    new MUSIC.Instrument(soundGenerator)
                .mapNote(function(n) { return n + 36; });

// add instrument to show on UI
instruments.add("Square wave oscillator with vibrato", instrument);