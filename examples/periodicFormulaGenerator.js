// create the sound generator
var twopi = Math.PI * 2;
var sineWaveSoundGenerator = {
  freq: function(fr) {
    var formulaNode = music
              .oscillator({f: function(t) {
                  // t ALWAYS varies from 0 to 1, this simplify the maths a lot for any
                  // wave form
                  return Math.sin(twopi * t);
              }, frequency: fr});

    return formulaNode;

  }
};

var sawWaveSoundGenerator = {
  freq: function(fr) {
    var formulaNode = music
              .oscillator({f: function(t) {
                  // t ALWAYS varies from 0 to 1, this simplify the maths a lot for any
                  // wave form
                  return t*2-1;
              }, frequency: fr});

    return formulaNode;

  }
};

// create the instrument from sound generator
var instrument = 
    new MUSIC.Instrument(sineWaveSoundGenerator)
                .mapNote(function(n) { return n + 36; });
// add instrument to show on UI
instruments.add("Custom sine wave oscillator", instrument);

instrument = 
    new MUSIC.Instrument(sawWaveSoundGenerator)
                .mapNote(function(n) { return n + 36; });

instruments.add("Custom saw wave oscillator", instrument);
