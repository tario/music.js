(function() {

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

var instrumentExtend = function(obj) {
  var delayedPlaying = function(originalPlaying, ms) {
    return {
      stop: function() {
        setTimeout(originalPlaying.stop.bind(originalPlaying), ms);
      } 
    };
  };

  var delayedNote = function(originalNote, ms) {
    return {
      play: function() {
        var originalPlaying = originalNote.play();
        return delayedPlaying(originalPlaying, ms);
      }
    };
  };

  obj.stopDelay = function(ms) {
    return instrumentExtend({
      note: function(noteNum) {
        return delayedNote(obj.note(noteNum), ms);
      }
    });
  };

  var parametrizedNote = function(note) {
    return {
      play: function() {
        var paramObject = {};
        var playing = note.play(paramObject);
        return {
          stop: playing.stop.bind(playing)
        }
      },
      during: during
    }
  };

  obj.perNoteWrap = function(wrapper) {
    return instrumentExtend({
      note: function(noteNum) {
        return wrapper(obj.note(noteNum));
      }
    });
  };

  return obj;
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

var during = function(duration) {
        var original = this;
        return {
          play: function() {
            var playable = original.play();
            setTimeout(playable.stop.bind(playable), duration);

            return original;
          },

          duration: function() { return duration; }
        };
      };

MUSIC.during = during;

MUSIC.Instrument = function(soundFactory) {
  this.note = function(notenum) {
    if (notenum === undefined) return undefined;

    var freq = frequency(notenum);
    return {
      play: function(param) {
        var soundInstance = soundFactory.play(param).setFrequency(freq);
        soundInstance.play(param);

        return {
          stop: function() {
            soundInstance.stop();
          }
        }
      },

      during: during
    };
  };

  instrumentExtend(this);
};

MUSIC.MultiInstrument = function(instrumentArray) {
  var notePlay = function(note) { return note.play(); };
  var noteStop = function(note) { return note.stop(); };

  var MultiNote = function(noteArray) {
    this.play = function() {
      var notes = noteArray.map(notePlay);
      return {
        stop: function() {
          notes.forEach(noteStop);
        }
      };
    };

    this.during = during;
  };

  this.note = function(noteNum) {
    return new MultiNote(instrumentArray.map(function(instrument){ 
      return instrument.note(noteNum);
    }));
  };
};

MUSIC.NoteShaper = function(fcn, stopDelay) {
  return function(note) {
      return {
          play: function() {
              var paramObject = {intensity:
                  function() {
                    return fcn(this.startedTime, this.stoppedTime, Date.now());
                  }
              };
              paramObject.startedTime = Date.now();
              var originalNote = note.play(paramObject);
              return {
                  stop: function() {
                      paramObject.stoppedTime = Date.now();
                      setTimeout(originalNote.stop.bind(originalNote), stopDelay);
                  }
              };
          },

          during: MUSIC.during
      };
  };
};

MUSIC.FadeoutNoteShaper = function(options) {
  options = options || {};
  var max = options.max || 1.0;
  var fadeoutSpeed = options.fadeoutSpeed || 0.005;

  return MUSIC.NoteShaper(function(startedTime, stoppedTime, currentTime) {
    if (stoppedTime) {
        var ret = max + (stoppedTime - currentTime)*fadeoutSpeed;
        if (ret < 0) ret = 0;
    } else {
        ret = max;
    }
    return ret;
  }, max/fadeoutSpeed);
};


})();