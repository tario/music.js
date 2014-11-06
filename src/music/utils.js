(function() {
MUSIC.Utils = MUSIC.Utils || {};
var nextNoteHash = {
  0: 2,
  2: 4,
  4: 5,
  5: 7,
  7: 9,
  9: 11,
  11: 12
};

MUSIC.Utils.Scale = function(base) {
  return {
    add: function(notenum, notes) {
      var octaveAdd = Math.floor(notes / 7)
      var noteNumOctave = Math.floor(notenum / 12);
      var ret;

      notes-= octaveAdd*7;

      ret = notenum - noteNumOctave*12;
      while (notes > 0) {
        ret = nextNoteHash[ret];
        notes--;
      }
      return ret + noteNumOctave*12 + octaveAdd*12;
    }
  };
};

})();