var effects = music;

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
]).mapNote(function(n){ return n+24;});

var iseq = MUSIC.InstrumentSequence(instrument, 25);
arpeggiator = {
  note: function(n) {
    return iseq([
      {num: n, time: 1},
      {num: n+2, time: 1},
      {num: n+4, time: 1},
      {num: n+6, time: 1},
      {num: n+8, time: 1},
      {num: n+10, time: 1}
    ]).loop();
  }
};

instruments.add("Oscillator SIN+SQ+SAW", instrument);
instruments.add("Arpeggiator", arpeggiator);


