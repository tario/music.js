MUSIC = {};

(function() {
MUSIC.SoundLib = MUSIC.SoundLib || {};
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
    return 293.66 * Math.pow(2, notenum/12);
};
var noteToNum = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11};
MUSIC.Instrument = function(soundFactory) {
  this.note = function(noteName) {
    var notenum;
    notenum = noteToNum[noteName]
    if (notenum === undefined) return undefined

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
      }
    };
  };
};

var commonExtension = function(obj) {
  obj.loop = function(times) {
    return MUSIC.Loop(this, times);
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

MUSIC.Silence = {
  play : function() {
    return {
      stop: function(){

      }
    }
  }
};

MUSIC.InstrumentSequence = function(instrument, beatTime) {
  return function(str) {
    var seq = MUSIC.Sequence();
    for (var i = 0; i < str.length; i++) {
      var noteName = str.charAt(i);
      var note = instrument.note(noteName);
      if (note) {
        seq.attachPlayable(note, beatTime, beatTime);
      } else {
        seq.attachPlayable(MUSIC.Silence, beatTime, beatTime);
      }
    };

    return seq;
  };
};

MUSIC.Sequence = function(notes) {
  notes = notes ? notes.slice() : [];

  return commonExtension({
    n: function(playable, duration, timespan) {
      var seq = MUSIC.Sequence(notes);
      seq.attachPlayable(playable, duration, timespan);
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

    attachPlayable: function(playableFactory, duration, timespan) {
      if (timespan === undefined) timespan = duration;
      notes.push( {f: function() {
        var playable = playableFactory.play();
        setTimeout(playable.stop.bind(playable), duration);
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
  seq.n = function(playable, duration, timespan) {
    if (Array.isArray(playable)) {
      var newseq = MUSIC.Sequence(notes); 
      for (var i = 0; i<playable.length-1; i++) {
        newseq.attachPlayable(playable[i], duration, 0);
      }
      newseq.attachPlayable(playable[i], duration, timespan);
      return newseq;
    } else {
      return origN.bind(seq)(playable, duration, timespan);
    }
  };

  return seq;
};

})();