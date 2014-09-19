MUSIC = {};

(function() {
MUSIC.SoundLib = MUSIC.SoundLib || {};

MUSIC.effectsPipeExtend = function(obj, audio, audioDestination) {
  obj.oscillator = function(options) {
    return new MUSIC.SoundLib.Oscillator(audio, audioDestination, options)
  };

  obj.noise = function(noiseweight) {
    return new MUSIC.Effects.Noise(audio, audioDestination, noiseweight)
  };

  obj.attenuator = function(fcn) {
    return new MUSIC.Effects.Attenuator(audio, audioDestination, fcn);
  };

  obj.formula = function(fcn) {
    return new MUSIC.Effects.Formula(audio, audioDestination, fcn);
  };

  return obj;
};

MUSIC.Context = function() {
  var audio = new window.webkitAudioContext();
  this.audio = audio;

  MUSIC.effectsPipeExtend(this, audio, audio.destination);
};

MUSIC.SoundLib.Oscillator = function(audio, destination, options) {
  options = options || {};

  this.play = function() {
    var osc;
    var frequency;

    return {
      setFrequency : function(newFreq) {
        frequency = newFreq;
        if (osc) osc.frequency.value = frequency;

        return this;
      },

      play : function() {
        if (!osc) {
          osc = audio.createOscillator();
          osc.frequency.value = frequency;

          osc.type = options.type;

          osc.connect(destination);
          osc.start(0);
        }

        return this;
      },

      stop : function() {
        if (osc) {
          osc.stop(0);
          osc.disconnect(destination);
          osc = undefined;
        }

        return this;
      }
    }
  };
};


var frequency = function(notenum) {
    return 36.7075 * Math.pow(2, notenum/12);
};
var noteToNumMap = {
  'C': 0, 
  'D': 2, 
  'E': 4, 
  'F': 5, 
  'G': 7, 
  'A': 9, 
  'B': 11,
  'C ': 0, 
  'D ': 2, 
  'E ': 4, 
  'F ': 5, 
  'G ': 7, 
  'A ': 9,
  'B ': 11
};

MUSIC.noteToNoteNum = function(noteName) {
  var notenum;

  notenum = noteToNumMap[noteName.charAt(0)]
  if (notenum === undefined) return undefined
  if (noteName.charAt(1) === '#') notenum++;
  if (noteName.charAt(1) === 'b') notenum--;
  if (noteName.charAt(2) !== "") notenum += (12 * parseInt(noteName.charAt(2)));
  return notenum;
};

MUSIC.Instrument = function(soundFactory, defaultOctave) {
  if (defaultOctave === undefined) defaultOctave = 3;

  this.note = function(noteName) {

    var notenum = MUSIC.noteToNoteNum(noteName); 
    if (notenum === undefined) return undefined;
    notenum += defaultOctave*12;

    var freq = frequency(notenum);
    return {
      play: function() {
        var soundInstance = soundFactory.play().setFrequency(freq);
        soundInstance.play();
        return {
          stop: function() {
            soundInstance.stop();
          }
        }
      },

      during: function(duration) {
        var original = this;
        return {
          play: function() {
            var playable = original.play();
            setTimeout(playable.stop.bind(playable), duration);

            return original;
          },

          duration: function() { return duration; }
        };
      }
    };
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
          var note = instrument.note(lastNote).during(accumulatedTime);
          seq.attachPlayable(note, accumulatedTime);
          accumulatedTime = 0;
        }

        var note = instrument.note(noteName);
        if (note) {
          accumulatedTime += beatTime;
          lastNote = noteName;
        } else if (noteName === "  ") {
          seq.attachPlayable(MUSIC.Silence(beatTime), beatTime);
        } else {
          noteName = aliases[noteName] || aliases[noteName.charAt(0)];
          note = instrument.note(noteName);
          if (note) {
            accumulatedTime += beatTime;
            lastNote = noteName;
          }
        }
      }
    };

    if (accumulatedTime > 0) {
      var note = instrument.note(lastNote).during(accumulatedTime);
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