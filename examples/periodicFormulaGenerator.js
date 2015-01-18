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


var twopi = Math.PI * 2;
var sine = function(fr){
  return function(t){
    return fr + Math.sin(twopi*t)*30;
  };
};

var sawWaveSoundGenerator = {
  freq: function(fr) {
    var periodicCurve = new MUSIC.Curve.Periodic(sine(fr),100);
    var periodicCurve2 = new MUSIC.Curve.Periodic(sine(fr),periodicCurve);
    var formulaNode = music
              .oscillator({f: function(t) {
                  // t ALWAYS varies from 0 to 1, this simplify the maths a lot for any
                  // wave form
                  return t*2-1;
              }, frequency: periodicCurve2});

    return formulaNode;

  }
};

instruments.add("Custom sine wave oscillator", sineWaveSoundGenerator);
instruments.add("Custom saw wave oscillator", sawWaveSoundGenerator);
