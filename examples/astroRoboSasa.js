// create the sound generator
var soundGenerator = {
  freq: function(fr) {
    return music
      .stopCurve({
        node: function(node) {
          return node.oscillator({type: 'square', frequency: fr});
        },
        duration: 0.01
      });

  }
};

// create the instrument from sound generator
var instrument = 
    new MUSIC.Instrument(soundGenerator);

var melody1 = MUSIC.Pattern([[
    "C4D4E4C4D4C4====....A#4=F4==....", instrument
  ]],
  {pulseTime: 100})

instruments.add("Square wave oscillator", instrument.mapNote(function(n){return n+36;}));
playables.add("Sasa lvl 1 song", melody1);