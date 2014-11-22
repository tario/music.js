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
var stopC = new MUSIC.Curve.Ramp(1260, 1260/2, 100).during(0.1);
var stopLp = new MUSIC.Curve.Ramp(2000, 800, 100).during(0.2);
var noiseCurveParams = {node: function(x){return x.noise()}, duration: 0.1};
var rythmSounds = {
  note: function(n) {
    // noise instrument to simulate kick
    if (n % 12 === 0 || n % 12 === 2 || n % 12 === 4) {
      if (n % 12 === 0) {
        return snare1effects.stopCurve(noiseCurveParams).during(100);
      } else if (n % 12 === 2) {
        return snare2effects.stopCurve(noiseCurveParams).during(100);
      } else {
        return snare3effects.stopCurve(noiseCurveParams).during(100);
      }
    } else if (n % 12 === 5) {
      return hieffects.stopCurve({
        node: function(nnode) {
          /* Apply dropoff effect using a curve for frequency parameter*/
          return nnode.oscillator({type: 'sine', frequency: stopC})
        },
        duration: 0.1
      }).during(100);
    } else if (n % 12 === 7) {
      return music.stopCurve({
        node: function(nnode) {
          // TODO isolate this effect on effect library
          var lp = nnode.lowpass({frequency: stopLp});
          return lp
                  .noise()
                  .onStop(function() {
                    lp.dispose();
                  });
        },
        duration: 0.1
      }).during(200);
    }
  }
};

instruments.add("Oscillator SIN+SQ+SAW", instrument);
instruments.add("Arpeggiator", arpeggiator);
instruments.add("Rythm Sounds", rythmSounds);

