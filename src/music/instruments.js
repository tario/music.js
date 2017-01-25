(function() {

var frequency = function(notenum) {
    return 16.35 * Math.pow(2, notenum/12);
};
var noteToNumMap = {
  'C': 0, 
  'D': 2, 
  'E': 4, 
  'F': 5, 
  'G': 7, 
  'A': 9, 
  'B': 11
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
      play: function(param) {
        var originalPlaying = originalNote.play(param);
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

  obj.perNoteWrap = function(wrapper) {
    return instrumentExtend({
      note: function(noteNum) {
        return wrapper(obj.note(noteNum));
      }
    });
  };

  obj.mapNote = function(fcn) {
    return instrumentExtend({
      note: function(noteNum) {
        return obj.note(fcn(noteNum));
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

MUSIC.PolyphonyInstrument = function(innerFactory, maxChannels) {
  var instrumentArray = [];
  var onUse = [];
  var queue = [];

  var freeIdx = function(maxChannels) {
    for (var i=0; i<maxChannels; i++) {
      if (!onUse[i]) return i;
    }
    return queue[0]||0;
  };

  this.note = function(notenum) {
    var c = maxChannels();
    var playingIdx = freeIdx(c);
    var instrument = instrumentArray[playingIdx];

    if (!instrument) {
      instrument = innerFactory();
      instrumentArray[playingIdx] = instrument;
    }

    queue.push(playingIdx);
    if (queue.length > c) queue.shift();

    onUse[playingIdx] = true;
    return instrument.note(notenum)
      .onStop(function() {
        onUse[playingIdx] = false;
      });
  };

  instrumentExtend(this);
};

MUSIC.MonoNoteInstrument = function(inner) {
  var noteInst;
  var playingInst;
  var count = 0;

  this.note = function(notenum) {
    if (!noteInst) {
      noteInst = inner.note(notenum);
    }

    return MUSIC.playablePipeExtend({
      play: function(param) {
        if (!playingInst) {
          playingInst = noteInst.play(param);
        }

        noteInst.setValue(notenum);

        count++;
        return {stop: function() {
          count--;
          if (noteInst.reset && count === 0) noteInst.reset();
        }};
      } 
    });
  };

  instrumentExtend(this);
};

MUSIC.Instrument = function(soundFactory) {
  this.note = function(notenum) {
    if (notenum === undefined) return undefined;

    var freq = frequency(notenum);
    return MUSIC.playablePipeExtend({
      play: function(param) {
        var fr = soundFactory.freq(freq);
        var soundInstance = fr.play(param);

        if (fr.setFreq) {
          this.setValue = function(n) {
            fr.setFreq(frequency(n));
          };

          this.reset = fr.reset.bind(fr);
        }

        return {
          stop: function() {
            soundInstance.stop();
          }
        }
      }
    });
  };

  instrumentExtend(this);
};

MUSIC.instrumentExtend = instrumentExtend;
MUSIC.Instrument.frequency = frequency;

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
    }
  };

  this.note = function(noteNum) {
    return MUSIC.playablePipeExtend(new MultiNote(instrumentArray.map(function(instrument){ 
      return instrument.note(noteNum);
    })));
  };

  instrumentExtend(this);

};

var NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
var noteNumToNoteName = function(noteNum) {
  var noteName = NOTES[noteNum % 12];
  var octaveNum = (Math.floor(noteNum / 12 + 1));

  return noteName + octaveNum;
};

MUSIC.PatchInstrument = function(notes) {
  var noteNum;
  var sounds = [];

  for (var noteName in notes) {
    var playable = MUSIC.Types.cast("playable", notes[noteName]);
    noteNum = MUSIC.noteToNoteNum(noteName);
    sounds[noteNum] = playable;
  };

  this.note = function(noteNum) {
    var s = sounds[noteNum];
    if (!s) return s;
    return MUSIC.playablePipeExtend({
      play: s.play
    });
  };

  instrumentExtend(this);
};

MUSIC.SoundfontInstrument = function(sounds, audio, audioDestination) {

  var noteAudio = [];

function _base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        var ascii = binary_string.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes.buffer;
};
  audio = audio.audio
  
  for (var i = 0; i<72; i++) {
    (function() {
      var index = i;
      var xmlhttp=new XMLHttpRequest();
      var noteName = noteNumToNoteName(i);
      var data = sounds[noteName];
      var encoded = data.split(",")[1];

      audio.decodeAudioData(_base64ToArrayBuffer(encoded), function(buffer) {
        noteAudio[index] = buffer;
      }, function(err) {
        console.error("error " + err + " loading " + index);
      });

    })();
  };

  this.note = function(notenum) {
    var source = audio.createBufferSource();
    return MUSIC.playablePipeExtend({
      play: function() {
        var source = audio.createBufferSource();
        source.buffer = noteAudio[notenum];
        source.connect(audioDestination._destination);
        source.start(0);
        return {
          stop: function() {
            source.stop(0);
            source.disconnect(audioDestination._destination);
          }
        };
      }
    });
  };

  instrumentExtend(this);

};

MUSIC.Types.register("instrument", function(instrument) {
  if (instrument.note) return instrument;
});

MUSIC.Types.register("instrument", function(soundGenerator) {
  if (soundGenerator.freq) {
    return new MUSIC.Instrument(soundGenerator);
  }
});

MUSIC.Types.register("instrument", function(playable) {
  if (playable.play) {
    return {
      note: function(){
        return playable;
      }
    };
  }
});

var nullPlay = {
  play: function(){
    return {stop: function(){}};
  }
};

MUSIC.Types.register("instrument", function(fcn) {
  if (typeof fcn === "function") {
    return {
      note: function(n) {
        return fcn(n) || nullPlay;
      }
    };
  }
});

MUSIC.Types.register("instrument", function(array) {
  if (array instanceof Array) {
    return new MUSIC.MultiInstrument(array);
  }
});

MUSIC.Types.register("instrument", function(plainObject) {
  if (typeof plainObject === "object" && plainObject.constructor === Object) {
    return new MUSIC.PatchInstrument(plainObject)
  }
});

MUSIC.StopEvent = function() {
  return function(note) {
      return MUSIC.playablePipeExtend({
          play: function() {
              var paramObject = {
                  onplay: function() {},
                  onstop: function() {}
              };

              var originalNote = note.play(paramObject);
              paramObject.onplay();
              return {
                  stop: function() {
                      paramObject.onstop();
                      originalNote.stop();
                  }
              };
          }
      });
  };
};

})();