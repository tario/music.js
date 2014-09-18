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
    return {
      play: function() {
        var soundInstance = soundFactory.play().setFrequency(frequency(noteToNum[noteName]));
        soundInstance.play();
        return {
          stop: function() {
            soundInstance.stop();
          };
        }
      }
    };
  };
};

MUSIC.Sequence = function(notes) {
  notes = notes || [];

  return {
    instrument: function(i) {
      var seq = MUSIC.Sequence(notes);
      seq.changeInstrument(i);
      return seq;
    },

    note: function(noteName, duration) {
      var seq = MUSIC.Sequence(notes);
      seq.attach(noteName, duration);
      return seq;
    },

    changeInstrument: function(i) {
      notes.push( {instrument: i});
    },

    attach: function(noteName, duration) {
      notes.push( {noteName: noteName, duration: duration, freq: frequency(noteToNum[noteName])});
    },

    play: function() {
      var currentInstrument;
      var currentDuration = 0;
      for (var i = 0; i < notes.length; i++) {
        var n = notes[i];
        if (n.instrument) {
          (function(ins) {
            setTimeout(function(){ currentInstrument = ins },currentDuration);
          })(n.instrument);
        } else {
          (function(n, currentDuration) {
            setTimeout(function() {
              var playingNote = currentInstrument.play();
              playingNote.setFrequency(n.freq);
              playingNote.play();
              setTimeout(playingNote.stop.bind(playingNote), n.duration);
            }, currentDuration);
          })(n, currentDuration);
          currentDuration = currentDuration + n.duration;
        }
      }
    }
  };
};


})();