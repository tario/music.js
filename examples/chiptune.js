var effects = music.gain(0.5).echo({gain: 0.5, delay: 0.1});

var g1 = effects.gain(0.3);
var g2 = effects.gain(0.3);
var g3 = effects.gain(0.3);

var squareSoundGenerator = {
  freq: function(fr) {
    return g1.oscillator({type: 'square', frequency: fr})
  }
};

var sineSoundGenerator = {
  freq: function(fr) {
    return g2.oscillator({type: 'sine', frequency: fr})
  }
};

var sawSoundGenerator = {
  freq: function(fr) {
    return g2.oscillator({type: 'sawtooth', frequency: fr})
  }
};

var instrument = new MUSIC.MultiInstrument([
  new MUSIC.Instrument(squareSoundGenerator),
  new MUSIC.Instrument(sineSoundGenerator),
  new MUSIC.Instrument(sawSoundGenerator)
]).mapNote(function(n){ return n+24} /* add one octave to sound */);

var iseq = MUSIC.InstrumentSequence(instrument, 50);
var cmajorscale = MUSIC.Utils.Scale(0);
arpeggiator = {
  note: function(n) {
    return iseq([
      {num: n, time: 1},
      {num: cmajorscale.add(n,1), time: 1},
      {num: cmajorscale.add(n,2), time: 1},
      {num: cmajorscale.add(n,3), time: 1},
      {num: cmajorscale.add(n,4), time: 1},
      {num: cmajorscale.add(n,5), time: 1}
    ]).loop();
  }
};

var snare1effects = music.gain(1.4).lowpass({frequency: 1000});
var snare2effects = music.lowpass({frequency: 2000});
var snare3effects = music.gain(0.7);
var hieffects = music.lowpass({frequency: 600});
var stopCurve = new MUSIC.Curve.Ramp(1.0, 0.0, 100).during(0.1);

var noiseWithStopCurve = function(baseGainNode) {
      return baseGainNode
              .noise()
              .onStop(function(){baseGainNode.dispose(); }) // dispose gain node
              .stopDelay(100)
              .onStop(function(){ baseGainNode .setParam('gain', stopCurve); }); // set gain curve
};

var stopC = new MUSIC.Curve.Ramp(1260, 1260/2, 100).during(0.1);
var rythmSounds = {
  note: function(n) {
    // noise instrument to simulate kick
    if (n % 12 === 0 || n % 12 === 2 || n % 12 === 4) {
      if (n % 12 === 0) {
        return noiseWithStopCurve(snare1effects.gain(1.0));
      } else if (n % 12 === 2) {
        return noiseWithStopCurve(snare2effects.gain(1.0));
      } else {
        return noiseWithStopCurve(snare3effects.gain(1.0));
      }
    } else if (n % 12 === 5) {
      var gainNode = hieffects.gain(1.0);
      return gainNode.oscillator({type: 'sine', frequency: stopC /* Apply dropoff effect using a curve for frequency parameter*/})
              .onStop(function(){ gainNode.dispose(); }) // dispose gain node
              .stopDelay(100)
              .onStop(function(){ gainNode .setParam('gain', stopCurve); }); // set gain curve      
    }
  }
};

instruments.add("Oscillator SIN+SQ+SAW", instrument);
instruments.add("Arpeggiator", arpeggiator);
instruments.add("Rythm Sounds", rythmSounds);

