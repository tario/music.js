MUSIC = {};

(function() {
MUSIC.SoundLib = MUSIC.SoundLib || {};

var getTemporalPipeline = function(effectsFcn, next, param) {
  var nextNode = effectsFcn(next, param);
  return {
    _destination: nextNode._destination,
    dispose: function() {
      var x = nextNode;
      while (1) {
        x.disconnect();
        x = x.next();
        if (x === next) {
          break;
        }
      };
      disposeNode = null;
    }
  };

};

MUSIC.playablePipeExtend = function(obj) {
  obj.during = function(duration) {
    var original = this;
    return MUSIC.playablePipeExtend({
      play: function() {
        var playable = original.play();
        setTimeout(playable.stop.bind(playable), duration);

        return original;
      },

      duration: function() { return duration; }
    });
  };

  obj.stopDelay = function(delay) {
    var original = this;
    return MUSIC.playablePipeExtend(
      {
        play: function(param) {
          var playing = original.play(param);
          return {
            stop: function() {
              setTimeout(playing.stop.bind(playing), delay);
            }
          };
        }
      }
    );
  };

  return obj;
};

MUSIC.effectsPipeExtend = function(obj, audio, audioDestination) {

  obj.oscillator = function(options) {
    return new MUSIC.SoundLib.Oscillator(audio, audioDestination, options);
  };

  obj.noise = function() {
    return new MUSIC.SoundLib.Noise(audio, audioDestination);
  };

  MUSIC.Effects.forEach(function(sfxName, sfxFunction) {
    var method = function(argument) {
      return new sfxFunction(audio, audioDestination, argument);
    };
    obj[sfxName] = method;
  });

  obj.soundfont = function(param) {
    return new MUSIC.SoundfontInstrument(param, audio, audioDestination);
  };

  obj.sound = function(path) {
    var request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.responseType = "arraybuffer";
    var audioBuffer;

    request.onerror = function(err) {
      console.error(err);
    };

    request.onload = function(e) {
      audio.decodeAudioData(request.response, function (buffer) {
        audioBuffer = buffer;
      });
    };

    request.send();
    return MUSIC.playablePipeExtend({
      play: function() {
        var bufferSource = audio.createBufferSource();
        bufferSource.buffer = audioBuffer;
        bufferSource.connect(audioDestination._destination);
        bufferSource.start(audio.currentTime);

        return {
          stop: function() {
            bufferSource.stop();
            bufferSource.disconnect(audioDestination._destination);
          }
        };
      }
    });
  };

  if (!obj.getNext) {
    obj.getNext = function() {
      return {
        _destination: obj._destination,
        dispose: function() {
        }
      };
    };
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

MUSIC.SoundLib.Oscillator = function(audio, destination, options) {
  options = options || {};
  var effects = options.effects;

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

        nextNode = destination;
        if (effects) {
          nextNode = getTemporalPipeline(effects, nextNode, param);
        }

        audioDestination = nextNode._destination;
        disposeNode = function() {
          osc.disconnect(audioDestination);
          nextNode.dispose();
        };
        osc.connect(audioDestination);
        osc.start(0);

        return {
          stop : function() {
            osc.stop(0);
            disposeNode();
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

var displaceNote = function(ammount) {
  return function(n) {
    return {f: n.f, duration: n.duration, relativeTime: n.relativeTime + ammount};
  };
};

MUSIC.Loop = function(playable, times) {
  var original = playable;
  var duration = playable.duration();

  var newNotes = [];
  for (var i=0; i<times; i++) {
    newNotes = newNotes.concat(original._notes.map(displaceNote(duration*i)));
  }

  return MUSIC.Sequence(newNotes);
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
  var currentDuration = 0;

  return commonExtension({
    _notes: notes, 
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
      }, duration: timespan, relativeTime: currentDuration});
      currentDuration = currentDuration + timespan;
    },

    play: function() {
      var currentDuration = 0;
      var currentNotes = notes.slice();

      var startTime = window.performance.now();
      var checkEvents = function() {
        var nextEvent;
        var realRelativeCurrentTime = window.performance.now() - startTime;
        var offset;

        while (1) {
          nextEvent = currentNotes.shift();
          if (nextEvent === undefined) {
            clearInterval(intervalHandler);
            break;
          }
          offset = nextEvent.relativeTime - realRelativeCurrentTime;
          setTimeout(nextEvent.f, offset);
          if (offset > 1000) break;
        };

      };
      checkEvents();
      var intervalHandler = setInterval(checkEvents, 500);

      return {
        stop: function() {
          clearInterval(intervalHandler);
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