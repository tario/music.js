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
    return {
      note: function(noteName) {
        return delayedNote(obj.note(noteName), ms);
      }
    };
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

  this.note = function(noteName) {
    return new MultiNote(instrumentArray.map(function(instrument){ 
      return instrument.note(noteName);
    }));
  };
};

})();