// create the sound generator
var bitCrusher = function(t) {
  return Math.floor(t*16)/16;
};
var sfx = music.gain(4.0);

var pi = Math.PI;
var modernTalking = new MUSIC.SoundLib.Wave("src/sound/moderntalking.wav", 61.6);
var sineCurve = new MUSIC.Curve.Formula(function(t){
  return 0.03*Math.sin(t - pi);
}).during(0.04);

var sineCurve2 = new MUSIC.Curve.Formula(function(t){
  return 600+200*Math.sin(100*(t - pi));
}).during(4);

var modernTalkingSoundGenerator = {
  freq: function(fr){

    var lp = sfx.lowpass({frequency: sineCurve2});
    return lp.oscillator({wave: modernTalking, frequency: fr, wtPosition: sineCurve}).onStop(function(){
      lp.dispose();
    });
  }
};

var twopi = Math.PI * 2;
var quarterGain = music.gain(0.15).T("reverb", {room:0.05, damp:0.1, mix:0.75});
var sineWave = function(t) {
                  // t ALWAYS varies from 0 to 1, this simplify the maths a lot for any
                  // wave form
                  return Math.sin(twopi * t);
              };
var sineWaveSoundGenerator = {
  freq: function(fr) {
    var formulaNode = quarterGain
              .oscillator({f: sineWave, frequency: fr});

    return formulaNode;

  }
};

var squareWave = function(t) {
                  // t ALWAYS varies from 0 to 1, this simplify the maths a lot for any
                  // wave form
                  return t>0.5? 1: -1;
              };
var squareWaveSoundGenerator = {
  freq: function(fr) {
    var formulaNode = quarterGain
              .oscillator({f: squareWave, frequency: fr});

    return formulaNode;

  }
};


// create the instrument from sound generator
var instrument = new MUSIC.MultiInstrument([
    new MUSIC.Instrument(modernTalkingSoundGenerator).mapNote(function(n){return n-24;}),
    new MUSIC.Instrument(sineWaveSoundGenerator).mapNote(function(n){return n-36;}),
    new MUSIC.Instrument(squareWaveSoundGenerator).mapNote(function(n){return n-36;})
  ]);

// add instrument to show on UI
return instrument;