// create the sound generator
var squareWave = function(volume){
  var baseEffect = music.gain(volume);
  var soundGenerator = {
  freq: function(fr) {
    return baseEffect
      .stopCurve({
        node: function(node) {
          return node.oscillator({type: 'square', frequency: fr});
        },
        duration: 0.01
      });

  }
  };
  
  return new MUSIC.Instrument(soundGenerator);
};

// create the instrument from sound generator
var instrument = squareWave(1.0).mapNote(function(n){return n-12;});
var bass = squareWave(0.7).mapNote(function(n){return n-12;});


var melody1 = MUSIC.Pattern([
    ["C5==D5==E5==C5==|D5==C5==========|........A#5=====|F5======........", instrument],
    ["C1==....C1==C2==|....A#1=....D1==|C1==....B#0=Bb1=|....G1==....D1==", bass]
  ],
  {pulseTime: 50});

var melody2 = MUSIC.Pattern([
    ["C5==C5==C5==F5==|D5==D5==D5==G5==|====............|G5======G4====..", instrument],
    ["................|................|....D1==C1==B0==|A#0=B0==C1==D1==", bass]
  ],
  {pulseTime: 50});

window.melody = melody2;

var song = new MUSIC.Song([
    "XXXYXXXYXXXYXXXYXXXYXXXYXXXYXXXYXXXYXXXYXXXY" 
  ], {X: melody1, Y: melody2}, {measure: 50*16*4 });

instruments.add("Square wave oscillator", instrument.mapNote(function(n){return n+48;}));
playables.add("pattern1", melody1);
playables.add("pattern2", melody2);
playables.add("Full song", song);