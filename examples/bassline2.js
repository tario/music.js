// create the sound generator
var bitCrusher = function(t) {
  return Math.floor(t*4)/4;
};
var sfx = music.gain(4.0).formula(bitCrusher);
var distort = sfx.T("efx.dist", {pre:-60, post:18, freq:2400});

var pi = Math.PI;
var sineCurve = new MUSIC.Curve.Formula(function(t){
  return 0.03*Math.sin(120*t);
}).during(4);

var sineCurve2 = new MUSIC.Curve.Formula(function(t){
  return 600+530*Math.sin(120*t);
}).during(4);

var heavyWaveForm = function(t) {
  return t<0.1? 1 : -t*0.5;
};

var createHeavyBass = function(sfxBase, lpFrequency, wtPosition) {
  var soundGenerator = {
    freq: function(fr){

      return sfxBase.stopCurve({
        node: function(node){
          var lp = node.lowpass({frequency: lpFrequency});
          return lp.oscillator({f: heavyWaveForm, frequency: fr, wtPosition: wtPosition}).onStop(function(){
            lp.dispose();
          });
        },
        duration:0.4
      });
    }
  };
  return new MUSIC.Instrument(soundGenerator).mapNote(function(n){return n-24;});
};

var decrescendo = new MUSIC.Curve.Formula(function(t){
  return 0.2*Math.sin(2*t)*Math.exp(-t);
}).during(2);
// add instrument to show on UI
return createHeavyBass(sfx, sineCurve2, 0);
