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

var effects2 = music.lowpass({frequency: 400});
var stopCurve = new MUSIC.Curve.Ramp(1.0, 0.0, 100).during(0.1);

var noiseInstrument = { // noise instrument to simulate kick
  note: function() {
    var gainNode = effects2.gain(1.0);
    return gainNode
            .noise()
            .onStop(function(){gainNode.dispose(); }) // dispose gain node
            .stopDelay(100)
            .onStop(function(){ gainNode.setParam('gain', stopCurve); }); // set gain curve
            ;
  }
};

instruments.add("Oscillator SIN+SQ+SAW", instrument);
instruments.add("Arpeggiator", arpeggiator);
instruments.add("Noise", noiseInstrument);

