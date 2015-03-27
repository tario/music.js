// create the sound generator
var soundGenerator = {
  freq: function(fr) {
    return music.
            stopCurve({
              node: function(node) {
                return node.oscillator({type: 'square', frequency: fr});
              }, 
              duration: 0.3
            });
  }
};

// create the instrument from sound generator
var instrument = 
    new MUSIC.Instrument(soundGenerator)
                .mapNote(function(n) { return n + 36; });

// add instrument to show on UI
return instrument;