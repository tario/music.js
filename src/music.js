MUSIC = {};

(function() {
MUSIC.SoundLib = MUSIC.SoundLib || {};

MUSIC.effectsPipeExtend = function(obj, audio, audioDestination) {
  obj.oscillator = function(options, nextProvider) {
    return new MUSIC.SoundLib.Oscillator(audio, audioDestination, options, nextProvider);
  };

  obj.noise = function() {
    return new MUSIC.SoundLib.Noise(audio, audioDestination);
  };

  obj.attenuator = function(fcn) {
    return new MUSIC.Effects.Attenuator(audio, audioDestination, fcn);
  };

  obj.formula = function(fcn) {
    return new MUSIC.Effects.Formula(audio, audioDestination, fcn);
  };

  obj.soundfont = function(param) {
    return new MUSIC.SoundfontInstrument(param, audio, audioDestination);
  };

  obj.lowpass = function(freq) {
    return new MUSIC.Effects.LowPass(audio, audioDestination, freq);
  };

  obj.gain = function(value) {
    return new MUSIC.Effects.Gain(audio, audioDestination, value);
  };

  obj.delay = function(value) {
    return new MUSIC.Effects.Delay(audio, audioDestination, value);
  };

  obj.reverb = function(value) {
    return new MUSIC.Effects.Reverb(audio, audioDestination, value);
  };

  return obj;
};

MUSIC.Context = function() {
  var audio = new window.webkitAudioContext();
  var music = this;

  this._destination = audio.destination;
  this.audio = audio;
  this.wrap = function(destination) {
    var ret = {};
    MUSIC.effectsPipeExtend(ret, audio, destination);
    return ret;
  };

  MUSIC.effectsPipeExtend(this, audio, this);
};

MUSIC.SoundLib.Noise = function(audio, nextProvider) {
  this.play = function(param) {
    var audioDestination;
    var noiseGenerator = new MUSIC.Effects.Formula(audio, nextProvider, function() {
      return Math.random();
    });

    return {
      stop: function() {
        noiseGenerator.disconnect(nextProvider._destination);
      }
    }
  };
};

MUSIC.SoundLib.Oscillator = function(audio, destination, options, nextProvider) {
  options = options || {};

  this.freq = function(newFreq) {
    var osc;
    var frequency = newFreq;
    var nextNode;
    var disposeNode;

    return {
      play : function(param) {
        var audioDestination;
        osc = audio.createOscillator();
        osc.frequency.value = frequency;

        osc.type = options.type;

        if (nextProvider) {
          nextNode = nextProvider(MUSIC.effectsPipeExtend({}, audio, destination), param);
          audioDestination = nextNode._destination;
          disposeNode = function() {
            var x = nextNode;
            osc.disconnect(audioDestination);

            while (1) {
              x.disconnect();
              x = x.next();
              if (x === destination) {
                break;
              }
            };
            disposeNode = null;
          };
          osc.connect(audioDestination);
        } else {
          nextNode = destination;
          audioDestination = nextNode._destination;
          disposeNode = function() {
            osc.disconnect(audioDestination);
            disposeNode = null;
          };
          osc.connect(audioDestination);
        }
        osc.start(0);

        return {
          stop : function() {
            osc.stop(0);
            disposeNode();
            osc = undefined;
          }
        };
      }

    }
  };
};

var commonExtension = function(obj) {
  obj.loop = function(times) {
    return MUSIC.Loop(this, times);
  };

  obj.measure = function(totalDuration){
    var original = this;
    return commonExtension({
      play: original.play.bind(original),
      duration: function() {
        return totalDuration;
      }
    });
  };

  return obj;
};

MUSIC.Loop = function(playable, times) {
  var original = playable;
  var duration = playable.duration();

  return commonExtension({
    duration: function() {
      return times * duration;
    },

    play: function() {
      var counter = times;
      var playable;
      var playAgain = function() {
        playable = original.play();
        counter = counter - 1;
        if (counter === 0) {
          clearInterval(interval);
        }
      };

      var interval = setInterval(playAgain, duration);
      playAgain();

      return {
        stop: function() {
          playable.stop();
          clearInterval(interval);
        }
      };
    }
  });
};

MUSIC.Silence = function(time) {
  return {
    play : function() {
      return {
        stop: function(){

        }
      }
    },

    duration: function(){return time}
  };
};

MUSIC.InstrumentSequence = function(instrument, beatTime) {
  return function(str, aliases) {
    var seq = MUSIC.Sequence();
    var lastNote;
    var accumulatedTime = 0;
    aliases = aliases || {};

    for (var i = 0; i < str.length; i+=2) {
      var noteName = str.charAt(i)+str.charAt(i+1);

      if (noteName === "--") {
        accumulatedTime += beatTime;
      } else {
        if (lastNote) {
          var note = instrument.note(MUSIC.noteToNoteNum(lastNote)).during(accumulatedTime);
          seq.attachPlayable(note, accumulatedTime);
          accumulatedTime = 0;
        }

        var note = instrument.note(MUSIC.noteToNoteNum(noteName));
        if (note) {
          accumulatedTime += beatTime;
          lastNote = noteName;
        } else if (noteName === "  ") {
          seq.attachPlayable(MUSIC.Silence(beatTime), beatTime);
        } else {
          noteName = aliases[noteName] || aliases[noteName.charAt(0)];
          note = instrument.note(MUSIC.noteToNoteNum(noteName));
          if (note) {
            accumulatedTime += beatTime;
            lastNote = noteName;
          }
        }
      }
    };

    if (accumulatedTime > 0) {
      var note = instrument.note(MUSIC.noteToNoteNum(lastNote)).during(accumulatedTime);
      seq.attachPlayable(note, accumulatedTime);
    }

    return seq;
  };
};

MUSIC.Sequence = function(notes) {
  notes = notes ? notes.slice() : [];

  return commonExtension({
    n: function(playable, timespan) {
      var seq = MUSIC.Sequence(notes);
      seq.attachPlayable(playable, timespan);
      return seq;
    },

    duration: function() {
      // compute total duration based on timespan
      var totalDuration = 0;
      for (var i = 0; i < notes.length; i++) {
        totalDuration+= notes[i].duration;
      };

      return totalDuration;
    },

    attachPlayable: function(playableFactory, timespan) {
      var duration = playableFactory.duration();
      if (timespan === undefined) timespan = duration;
      notes.push( {f: function() {
        playableFactory.play();
      }, duration: timespan});
    },

    play: function() {
      var timeOuts = [];
      var currentDuration = 0;
      for (var i = 0; i < notes.length; i++) {
        var n = notes[i];
        timeOuts.push(setTimeout(n.f, currentDuration));
        currentDuration = currentDuration + n.duration;
      }

      return {
        stop: function() {
          for (var i = 0; i<timeOuts.length; i++) {
            clearTimeout(timeOuts[i]);
          }
        }
      }
    }
  });
};

var originalSequence = MUSIC.Sequence;
MUSIC.Sequence = function(notes) {
  var seq = originalSequence(notes);
  var origN = seq.n;
  seq.n = function(playable, timespan) {
    if (Array.isArray(playable)) {
      var newseq = MUSIC.Sequence(notes); 
      for (var i = 0; i<playable.length-1; i++) {
        newseq.attachPlayable(playable[i], 0);
      }
      newseq.attachPlayable(playable[i], timespan);
      return newseq;
    } else {
      return origN.bind(seq)(playable, timespan);
    }
  };

  return seq;
};

})();