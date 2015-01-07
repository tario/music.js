// create the sound generator
var soundGenerator = {
  freq: function(fr) {
    return music.
            ADSR({
              node: function(node) {
                return node.oscillator({type: 'square', frequency: fr});
              }, 
              attackTime: 0.2,
              decayTime: 0.2,
              releaseTime: 0.2,
              sustainLevel: 0.8
            });
  }
};

// create the instrument from sound generator
var instrument = 
    new MUSIC.Instrument(soundGenerator)
                .mapNote(function(n) { return n + 36; });

// add instrument to show on UI
instruments.add("Square wave oscillator", instrument);